import User from '../entities/User';
import {
	REDIS_RESET_PASSWORD_PREFIX,
	SESSION_COOKIE_NAME,
} from '../utils/constants';
import {
	Arg,
	Ctx,
	Field,
	FieldResolver,
	Mutation,
	ObjectType,
	Query,
	Resolver,
	Root,
} from 'type-graphql';
import { ApolloServerContext } from 'src/types';
import argon2 from 'argon2';
import { validateRegister } from './validateRegister';
import { LoginInput, RegisterInput } from './InputTypes';
import { sendEmail } from '../utils/sendEmail';
import { v4 as uuidv4 } from 'uuid';
import { invalidPasswordError, tokenExpiredError } from '../utils/errors';
import { getConnection } from 'typeorm';

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

@Resolver(User)
class UserResolver {
  
	@FieldResolver()
	email(@Root() user: User, @Ctx() { req }: ApolloServerContext) {
		if (req.session.userId === user.id) return user.email;
		return '';
	}

	@Query(() => User, { nullable: true })
	me(@Ctx() { req }: ApolloServerContext) {
		const userId = req.session.userId;

		if (!userId) return null;

		return User.findOne(userId);
	}
	@Mutation(() => UserResponse)
	async changePassword(
		@Arg('token') token: string,
		@Arg('newPassword') newPassword: string,
		@Ctx() { req, redis }: ApolloServerContext
	): Promise<UserResponse> {
		if (!newPassword || newPassword.length <= 7)
			return {
				errors: [invalidPasswordError],
			};
		const key = REDIS_RESET_PASSWORD_PREFIX + token;
		const userIdStr = await redis.get(key);
		if (!userIdStr)
			return {
				errors: [tokenExpiredError],
			};
		const userId = parseInt(userIdStr);
		const user = await User.findOne(userId);
		if (!user)
			return {
				errors: [tokenExpiredError],
			};

		await User.update(
			{ id: userId },
			{ password: await argon2.hash(newPassword) }
		);

		await redis.del(key);

		req.session.userId = user.id;

		return {
			user,
		};
	}

	@Mutation(() => Boolean)
	async resetPassword(
		@Arg('email') email: string,
		@Ctx() { redis }: ApolloServerContext
	) {
		const user = await User.findOne({ where: { email } });
		if (!user) {
			return true;
		}
		const token = uuidv4();
		await redis.set(
			REDIS_RESET_PASSWORD_PREFIX + token,
			user.id,
			'ex',
			14400000 // 4 hours
		);
		sendEmail(
			email,
			'Reset password',
			`Hello ${user.username},<br />click <a href="http://localhost:3000/reset-password/${token}">reset password</a> to reset your password.`
		);
		return true;
	}

	@Mutation(() => UserResponse)
	async register(
		@Arg('options') { username, password, email }: RegisterInput,
		@Ctx() { req }: ApolloServerContext
	): Promise<UserResponse> {
		// TODO: Add advanced validation
		const errors = validateRegister({ username, password, email });
		if (errors) return { errors };
		const hashedPassword = await argon2.hash(password);
		let user;
		try {
			const result = await getConnection()
				.createQueryBuilder()
				.insert()
				.into(User)
				.values({ username, password: hashedPassword, email })
				.returning('*')
				.execute();
			//console.log('Result: ', result);
			user = result.raw[0];
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
		@Ctx() { req }: ApolloServerContext
	): Promise<UserResponse> {
		const user = await User.findOne({ where: { username: options.username } });
		if (!user)
			return {
				errors: [
					{
						field: 'username',
						message: "username doesn't exist",
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
