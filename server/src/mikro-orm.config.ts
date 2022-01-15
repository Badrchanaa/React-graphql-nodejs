import { __prod__ } from './utils/constants';
import { MikroORM } from '@mikro-orm/core';
import path from 'path';
import Post from './entities/Post';
import User from './entities/User';

require('dotenv').config();

const { dbname, dbuser, dbpassword } = process.env;

export default {
	migrations: {
		path: path.join(__dirname, './migrations'),
		pattern: /^[\w-]+\d+\.[tj]s$/,
		disableForeignKeys: false,
	},
	entities: [Post, User],
    clientUrl: `postgres://${dbuser}:${dbpassword}@surus.db.elephantsql.com/${dbname}`,
	type: 'postgresql',
	debug: !__prod__,
} as Parameters<typeof MikroORM.init>[0];
