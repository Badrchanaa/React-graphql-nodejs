import 'reflect-metadata';
require('dotenv').config();
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { HelloResolver, PostResolver, UserResolver } from './resolvers';
import { SESSION_COOKIE_NAME, __prod__ } from './utils/constants';
import Redis from 'ioredis';
import session from 'express-session';
import connectRedis from 'connect-redis';
import cors from 'cors';
import { createConnection } from 'typeorm';
import User from './entities/User';
import Post from './entities/Post';
import path from 'path';

const main = async () => {
  
  const { dbname, dbuser, dbpassword } = process.env;

  const db = await createConnection({
    type: 'postgres',
    url: `postgres://${dbuser}:${dbpassword}@surus.db.elephantsql.com/${dbname}`,
    logging: !__prod__,
    synchronize: !__prod__,
    migrations: [path.join(__dirname, './migrations/*')],
    entities: [Post, User],
  });

  db.runMigrations();

	const app = express();
	app.use(
		cors({
			origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'https://studio.apollographql.com'],
			credentials: true,
		})
	);
	const RedisStore = connectRedis(session);
  const redisClient = new Redis(process.env.REDIS_CONNECT_URL);

	app.set('trust proxy', !__prod__);
	const SESSION_SECRET = process.env.SESSION_SECRET;
	if (!SESSION_SECRET) throw new Error("SESSION_SECRET environment variable is not set");
	app.use(
		session({
			name: SESSION_COOKIE_NAME,
			store: new RedisStore({ client: redisClient, disableTouch: true }),
			cookie: {
				maxAge: 1000 * 3600 * 24 * 365 * 12, // 12 years
				httpOnly: true,
				sameSite: __prod__ ? 'lax' : 'none', // lax for csrf protection
				secure: true,
			},
			saveUninitialized: false,
			secret: SESSION_SECRET,
			resave: false,
		})
	);

	const apolloServer = new ApolloServer({
		schema: await buildSchema({
			resolvers: [HelloResolver, PostResolver, UserResolver],
			validate: false,
		}),
		context: ({ res, req }) => ({ res, req, redis: redisClient }),
	});

	await apolloServer.start();

	apolloServer.applyMiddleware({ app, cors: false });
  const PORT = process.env.PORT || 4000;
	app.listen(PORT, () => {
		console.log('Server started listening on port', PORT);
	});
};

main().catch((err) => console.log(err));
