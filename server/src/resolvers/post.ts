import Post from '../entities/Post';
import {
	Arg,
	Ctx,
	FieldResolver,
	Int,
	Mutation,
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

@Resolver(Post)
class PostResolver {
	@FieldResolver(() => String)
	textSnippet(@Root() root: Post) {
		return snippetFromText(root.text);
	}

	@Query(() => [Post])
	posts(
		@Arg('limit', () => Int) limit: number,
		@Arg('cursor', () => String, { nullable: true }) cursor: string | null
	): Promise<Post[]> {
		const realLimit = Math.min(POSTS_QUERY_LIMIT, limit);
		const query = getConnection()
			.getRepository(Post)
			.createQueryBuilder('p')
			.orderBy('"createdAt"', 'DESC')
			.take(realLimit);
		if (cursor) {
			query.where('"createdAt" < :cursor', {
				cursor: new Date(parseInt(cursor)),
			});
		}
		return query.getMany();
	}

	@Query(() => Post, { nullable: true })
	post(@Arg('id') id: number): Promise<Post | undefined> {
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
