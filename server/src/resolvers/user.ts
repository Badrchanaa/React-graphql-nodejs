import User from '../entities/User';
import { SESSION_COOKIE_NAME } from '../utils/constants';
import {
	Arg,
	Ctx,
	Field,
	InputType,
	Mutation,
	ObjectType,
	Query,
	Resolver,
} from 'type-graphql';
import { ApolloServerContext } from 'src/types';
import { EntityManager } from '@mikro-orm/postgresql';
import argon2 from 'argon2';

@InputType()
class RegisterInput {
	@Field()
	username: string;

	@Field()
	password: string;

	@Field()
	email: string;
}

@InputType()
class LoginInput {
	@Field()
	username: string;

	@Field()
	password: string;
}

@ObjectType()
class FieldError {
	@Field()
	field: string;

	@Field()
	message: string;
}

@ObjectType()
class UserResponse {
	@Field(() => [FieldError], { nullable: true })
	errors?: FieldError[];

	@Field(() => User, { nullable: true })
	user?: User;
}

@Resolver()
class UserResolver {
	@Query(() => User, { nullable: true })
	async me(@Ctx() { req, em }: ApolloServerContext): Promise<User | null> {
		const userId = req.session.userId;

		if (!userId) return null;

		const user = await em.findOne(User, { id: userId });

		return user;
	}

  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg('email') email: string,
    @Ctx() { em } : ApolloServerContext
  ){
    const user = em.findOne(User, {email});
    if (!user) return false;
    return true;
  }

	@Mutation(() => UserResponse)
	async register(
		@Arg('options') { username, password, email }: RegisterInput,
		@Ctx() { em, req }: ApolloServerContext
	): Promise<UserResponse> {
		if (!username || username.length <= 2)
			return {
				errors: [
					{
						field: 'username',
						message: 'length must be greater than 2.',
					},
				],
			};
		if (!password || password.length <= 7)
			return {
				errors: [
					{
						field: 'password',
						message: 'length must be greater than 7.',
					},
				],
			};
		const hashedPassword = await argon2.hash(password);
		let user;
		try {
			const result = await (em as EntityManager)
				.createQueryBuilder(User)
				.getKnexQuery()
				.insert({
					username,
					password: hashedPassword,
					email,
					created_at: new Date(),
					updated_at: new Date(),
				})
				.returning('*');

			user = result[0];
		} catch (err) {
			// Error duplicate field
			if (err.code === '23505')
				return {
					errors: [
						{
							field: err.detail.includes('username') ? 'username' : 'email',
							message: 'already exists',
						},
					],
				};
		}
		req.session.userId = user.id;

		return {
			user,
		};
	}

	@Mutation(() => UserResponse)
	async login(
		@Arg('options') options: LoginInput,
		@Ctx() { em, req }: ApolloServerContext
	): Promise<UserResponse> {
		const user = await em.findOne(User, { username: options.username });
		if (!user)
			return {
				errors: [
					{
						field: 'username',
						message: "That username doesn't exist",
					},
				],
			};

		const valid = await argon2.verify(user.password, options.password);

		if (!valid)
			return {
				errors: [
					{
						field: 'password',
						message: 'Invalid credentials',
					},
				],
			};

		req.session.userId = user.id;

		return {
			user,
		};
	}

	@Mutation(() => User, { nullable: true })
	async updateUser(
		@Arg('id') id: number,
		@Arg('username') username: string,
		@Ctx() { em }: ApolloServerContext
	): Promise<User | null> {
		const user = await em.findOne(User, { id });
		if (!user) return null;

		user.username = username;
		await em.persistAndFlush(user);

		return user;
	}

	@Mutation(() => Boolean)
	async deleteUser(
		@Arg('id') id: number,
		@Ctx() { em }: ApolloServerContext
	): Promise<boolean> {
		try {
			await em.nativeDelete(User, { id });
		} catch {
			return false;
		}
		return true;
	}

	@Mutation(() => Boolean)
	logout(@Ctx() { req, res }: ApolloServerContext) {
		return new Promise((resolve) =>
			req.session.destroy((err) => {
        res.clearCookie(SESSION_COOKIE_NAME);
				if (err) {
          console.log(err);
					resolve(false);
					return;
				}
				resolve(true);
			})
		);
	}
}
export default UserResolver;
