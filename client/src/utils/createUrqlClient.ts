import { dedupExchange, Exchange, fetchExchange, gql } from 'urql';
import { cacheExchange } from '@urql/exchange-graphcache';
import {
	LoginMutation,
	MeQuery,
	MeDocument,
	RegisterMutation,
	LogoutMutation,
  VoteMutationVariables
} from '../generated/graphql';
import { iUpdateQuery } from './iUpdateQuery';
import { pipe, tap } from 'wonka';
import Router from 'next/router';
import { cursorPagination } from './cursorPagination';
import { isServer } from './isServer';

const errorExchange: Exchange = ({ forward }) => (ops$) => {
		return pipe(
			forward(ops$),
			tap(({ error }) => {
				if (error){
          if(error.message.includes('not authenticated')){
            Router.replace('/login');
          }
        }
			})
		);
};

export const createUrqlClient = (ssrExchange: any, ctx: any) => {

  let cookie = '';
  if (isServer()){
    cookie = ctx.req.headers.cookie;
  }

  return {
    url: 'http://localhost:4000/graphql',
    fetchOptions: {
      credentials: 'include' as const,
      headers: { 'X-Forwarded-Proto': 'https',
      cookie
    },
    },
    exchanges: [
      dedupExchange,
      cacheExchange({
        keys: {
          PaginatedPosts: () => null,
        },
        resolvers: {
          Query: {
            posts: cursorPagination()
          }
        },
        updates: {
          Mutation: {
            vote: (_, args, cache, info) => {
              const {postId, value} = args as VoteMutationVariables;
              const data = cache.readFragment(
                gql`
                  fragment _ on Post {
                    id
                    points
                    voteStatus
                  }
                `,
                { id: postId }
              );
  
              if(data.voteStatus === value) return;
  
              if (data) {
                const newPoints = (data.points as number) + (!data.voteStatus ? value : 2 * value);
                cache.writeFragment(
                  gql`
                    fragment __ on Post {
                      points
                      voteStatus
                    }
                  `,
                  { id: postId, points: newPoints, voteStatus: value }
                );
              }
              
            },
            createPost: (_result, args, cache, info) => {
              const allFields = cache.inspectFields('Query');
              const postsFields = allFields.filter((fi) => fi.fieldName === 'posts');
              postsFields.forEach(fi => {
                cache.invalidate('Query', 'posts', fi.arguments);
              });
            },
            login: (_result, args, cache, info) => {
              iUpdateQuery<LoginMutation, MeQuery>(
                cache,
                { query: MeDocument },
                _result,
                (result, query) => {
                  if (result.login.errors) {
                    return query;
                  } else {
                    return {
                      me: result.login.user,
                    };
                  }
                }
              );
            },
            register: (_result, args, cache, info) => {
              iUpdateQuery<RegisterMutation, MeQuery>(
                cache,
                { query: MeDocument },
                _result,
                (result, query) => {
                  if (result.register.errors) {
                    return query;
                  } else {
                    return {
                      me: result.register.user,
                    };
                  }
                }
              );
            },
            logout: (_result, _, cache, __) => {
              iUpdateQuery<LogoutMutation, MeQuery>(
                cache,
                { query: MeDocument },
                _result,
                () => ({ me: null })
              );
            },
          },
        },
      }),
      errorExchange,
      ssrExchange,
      fetchExchange,
    ],
  }
};
