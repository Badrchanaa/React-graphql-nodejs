import Post from '../entities/Post';
import {
	Arg,
	Ctx,
	Field,
	FieldResolver,
	Int,
	Mutation,
	ObjectType,
	Query,
	Resolver,
	Root,
	UseMiddleware,
} from 'type-graphql';
import { PostInput } from './InputTypes';
import { ApolloServerContext } from 'src/types';
import { isAuth } from '../middlewares/isAuth';
import { getConnection } from 'typeorm';
import { POSTS_QUERY_LIMIT } from '../utils/constants';
import { snippetFromText } from '../utils/snippetFromText';
import Updoot from '../entities/Updoot';

@ObjectType()
class PaginatedPosts {
	@Field(() => [Post])
	posts: Post[];

	@Field(() => Boolean)
	hasMore: boolean;
}

const DOWN_VOTE = -1;
const UP_VOTE = 1;

@Resolver(Post)
class PostResolver {
	@FieldResolver(() => String)
	textSnippet(@Root() root: Post) {
		return snippetFromText(root.text);
	}

	@Mutation(() => String)
	@UseMiddleware(isAuth)
	async vote(
		@Arg('postId') postId: number,
		@Arg('value') value: number,
		@Ctx() { req }: ApolloServerContext
	) {
		const voteValue = value !== DOWN_VOTE ? UP_VOTE : DOWN_VOTE;
		const userId = req.session.userId;

		// await Updoot.insert({
		// 	postId,
		// 	userId,
		// 	value: voteValue,
		// });
		const updoot = await Updoot.findOne({
			where: { postId, userId },
			// lock: { mode: 'optimistic' as any , version: new Date(), tables: ['updoot'] },
		});
		// const updoot = await getConnection()
		// 	.createQueryBuilder(Updoot, 'updoot')
		// 	.setLock('pessimistic_write')
		//   .useTransaction(true)
		// 	.where({ userId, postId })
		// 	.getOne();
		if (!updoot) {
			await getConnection().transaction(async (tm) => {
				await tm.query(
					`insert into updoot ("postId", "userId", value)values ($1, $2, $3)`,
					[postId, userId, voteValue]
				);
				await tm.query(`update post set points = points + $1 where id = $2`, [
					voteValue,
					postId,
				]);
			});
		} else if (updoot.value !== voteValue) {
			await getConnection().transaction(async (tm) => {
				await tm.query(
					`update updoot set value = $1 where "postId" = $2 and "userId" = $3`,
					[voteValue, postId, userId]
				);
				await tm.query(`update post set points = points + $1 where id = $2`, [
					-2 * updoot.value,
					postId,
				]);
			});
		}
		return 'OK';
	}

	@Query(() => PaginatedPosts)
	async posts(
		@Arg('limit', () => Int) limit: number,
		@Arg('cursor', () => String, { nullable: true }) cursor: string | null,
		@Ctx() { req }: ApolloServerContext
	): Promise<PaginatedPosts> {
		const realLimit = Math.min(POSTS_QUERY_LIMIT, limit);
		const realLimitPlusOne = realLimit + 1;
		const replacements: any[] = [realLimitPlusOne];
		const userId = req.session.userId;
		if (userId) replacements.push(userId);
		let cursorIdx = 3;
		if (cursor) {
			replacements.push(new Date(parseInt(cursor)));
      cursorIdx = replacements.length;
		}

		const posts = await getConnection().query(
			`
      select p.*,
      json_build_object(
        'id', u.id,
        'username', u.username,
        'email', u.email,
        'createdAt', u."createdAt",
        'updatedAt', u."updatedAt"
      ) creator,
      ${
				userId
					? '(select value from updoot where "userId" = $2 and "postId" = p.id) "voteStatus"'
					: 'null as "voteStatus"'
			}
      from post p
      inner join public.user u on u.id = p."creatorId"
      ${cursor ? `where p."createdAt" < $${cursorIdx}` : ''}
      order by p."createdAt" DESC
      limit $1
    `,
			replacements
		);
		// const query = getConnection()
		// 	.getRepository(Post)
		// 	.createQueryBuilder('p')
		// 	.innerJoinAndSelect('p.creator', 'u', 'u.id = p."creatorId"')
		// 	.orderBy('p."createdAt"', 'DESC')
		// 	.take(realLimitPlusOne);
		// if (cursor) {
		// 	query.where('p."createdAt" < :cursor', {
		// 		cursor: new Date(parseInt(cursor)),
		// 	});
		// }
		// const posts = await query.getMany();
		return {
			posts: posts.slice(0, realLimit),
			hasMore: posts.length === realLimitPlusOne,
		};
	}

	@Query(() => Post, { nullable: true })
	post(@Arg('id', () => Int) id: number): Promise<Post | undefined> {
		return Post.findOne(id);
	}

	@Mutation(() => Post)
	@UseMiddleware(isAuth)
	createPost(
		@Arg('input') input: PostInput,
		@Ctx() { req }: ApolloServerContext
	): Promise<Post> {
		return Post.create({ ...input, creatorId: req.session.userId }).save();
	}

	@Mutation(() => Post, { nullable: true })
	async updatePost(
		@Arg('id') id: number,
		@Arg('title') title: string
	): Promise<Post | null> {
		const post = await Post.findOne(id);
		if (!post) return null;
		if (title && title.length > 0) await Post.update({ id }, { title });
		return post;
	}

	@Mutation(() => Boolean)
	async deletePost(@Arg('id') id: number): Promise<boolean> {
		try {
			await Post.delete(id);
		} catch {
			return false;
		}
		return true;
	}
}

export default PostResolver;
