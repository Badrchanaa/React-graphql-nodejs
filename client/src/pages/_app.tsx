import { ChakraProvider, ColorModeProvider } from '@chakra-ui/react';
import { createClient, dedupExchange, fetchExchange, Provider } from 'urql';
import { cacheExchange, Cache, QueryInput } from '@urql/exchange-graphcache';
import { LoginMutation, MeDocument, MeQuery, RegisterMutation } from '../generated/graphql';
import theme from '../theme';

function iUpdateQuery<Result, Query>(
	cache: Cache,
	qi: QueryInput,
	result: any,
	fn: (r: Result, q: Query) => Query
) {
	return cache.updateQuery(qi, data => fn(result, data as any) as any);
}

const client = createClient({
	url: 'http://localhost:4000/graphql',
	fetchOptions: {
		credentials: 'include',
		headers: { 'X-Forwarded-Proto': 'https' },
	},
	exchanges: [dedupExchange, cacheExchange({
		updates: {
			Mutation: {
				login: (_result, args, cache, info) => {
						iUpdateQuery<LoginMutation, MeQuery>(
							cache,
							{ query: MeDocument},
							_result,
							(result, query) => {
								if(result.login.errors) {
									return query
								}else {
									return {
										me: result.login.user,
									}
								}
							}
						)
					},
					register: (_result, args, cache, info) => {
						iUpdateQuery<RegisterMutation, MeQuery>(
							cache,
							{ query: MeDocument},
							_result,
							(result, query) => {
								if(result.register.errors) {
									return query
								}else {
									return {
										me: result.register.user,
									}
								}
							}
						)
					}
				}
			}
		}), fetchExchange],
});


interface appProps {
	Component: any;
	pageProps: any;
}

const MyApp: React.FC<appProps> = ({ Component, pageProps }) => {
	return (
		<Provider value={client}>
			<ChakraProvider resetCSS theme={theme}>
				<ColorModeProvider
					options={{
						useSystemColorMode: true,
					}}>
					<Component {...pageProps} />
				</ColorModeProvider>
			</ChakraProvider>
		</Provider>
	);
};

export default MyApp;
