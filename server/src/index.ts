import 'reflect-metadata';
import { MikroORM } from '@mikro-orm/core';
import mikroConfig from './mikro-orm.config';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { HelloResolver, PostResolver, UserResolver } from './resolvers';
import { __prod__ } from './utils/constants';
import redis from 'redis';
import session from 'express-session';
import connectRedis from 'connect-redis';
import cors from 'cors';

const main = async () => {
	const orm = await MikroORM.init(mikroConfig);
	await orm.getMigrator().up();

	const app = express();
	app.use(
		cors({
			origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'https://studio.apollographql.com'],
			credentials: true,
		})
	);
	const RedisStore = connectRedis(session);
	const redisClient = redis.createClient({
		url: process.env.REDIS_CONNECT_URL,
	});
	app.set('trust proxy', !__prod__);
	app.use(
		session({
			name: 'qid',
			store: new RedisStore({ client: redisClient, disableTouch: true }),
			cookie: {
				maxAge: 1000 * 3600 * 24 * 365 * 12, // 12 years
				httpOnly: true,
				sameSite: __prod__ ? 'lax' : 'none', // lax for csrf protection
				secure: true,
			},
			saveUninitialized: false,
			secret: 'SSRLeozfoE42F@ZoF/Ic9o?pv;oDXno',
			resave: false,
		})
	);

	const apolloServer = new ApolloServer({
		schema: await buildSchema({
			resolvers: [HelloResolver, PostResolver, UserResolver],
			validate: false,
		}),
		context: ({ res, req }) => ({ em: orm.em, res, req }),
	});

	await apolloServer.start();

	apolloServer.applyMiddleware({ app, cors: false });

	const PORT = process.env.PORT;

	app.listen(PORT || 4001, () => {
		console.log('Server started listening on port', PORT);
	});
};

main().catch((err) => console.log(err));
