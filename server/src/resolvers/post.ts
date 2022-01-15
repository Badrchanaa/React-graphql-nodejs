import Post from '../entities/Post';
import { Arg, Ctx, Mutation, Query, Resolver } from 'type-graphql';
import { ApolloServerContext } from 'src/types';

@Resolver()
class PostResolver {
	@Query(() => [Post])
	posts(@Ctx() { em }: ApolloServerContext): Promise<Post[]> {
		return em.find(Post, {});
	}

	@Query(() => Post, { nullable: true })
	post(
		@Arg('postId') id: number,
		@Ctx() { em }: ApolloServerContext
	): Promise<Post | null> {
		return em.findOne(Post, { id });
	}

	@Mutation(() => Post)
	async createPost(
		@Arg('title') title: string,
		@Ctx() { em }: ApolloServerContext
	): Promise<Post> {
		const post = em.create(Post, { title });
		await em.persistAndFlush(post);
		return post;
	}

	@Mutation(() => Post, { nullable: true })
	async updatePost(
		@Arg('id') id: number,
		@Arg('title') title: string,
		@Ctx() { em }: ApolloServerContext
	): Promise<Post | null> {
		const post = await em.findOne(Post, { id });
        if(!post) return null;

        post.title = title;
		await em.persistAndFlush(post);

		return post;
	}

    @Mutation(() => Boolean)
	async deletePost(
		@Arg('id') id: number,
		@Ctx() { em }: ApolloServerContext
	): Promise<boolean> {
        try{
            await em.nativeDelete(Post, { id });
        }catch{
            return false;
        }
        return true;
	}
}

export default PostResolver;