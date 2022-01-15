import { IDatabaseDriver, Connection } from "@mikro-orm/core";
import { EntityManager } from "@mikro-orm/core/EntityManager";
import { Request, Response } from 'express';

declare module 'express-session' {
	export interface SessionData {
	  userId: number;
	}
}

export type ApolloServerContext = {
    em: EntityManager<IDatabaseDriver<Connection>>;
    req: Request;
    res: Response;
}

