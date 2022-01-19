import { Stack, Text, Box, Heading, Button, Flex } from '@chakra-ui/react';
import { withUrqlClient } from 'next-urql';
import Layout from '../components/Layout';
import { usePostsQuery } from '../generated/graphql';
import { createUrqlClient } from '../utils/createUrqlClient';
import NextLink from 'next/link';
import { useState } from 'react';

const Index = () => {
	const [variables, setVariables] = useState({
		limit: 10,
		cursor: null as null | string,
	});

	const [{ data, fetching }] = usePostsQuery({
		variables,
	});

	if (!fetching && !data?.posts) return <div>something went wrong</div>;

	return (
		<Layout>
			<Flex mb={4} align="center">
				<Heading>Recent Posts</Heading>
				<NextLink href="/create-post">
					<Button ml="auto">Create post</Button>
				</NextLink>
			</Flex>
			{!data?.posts && fetching ? (
				<div>Loading...</div>
			) : (
				<Stack spacing={8}>
					{data!.posts.map((post) => (
						<Box p={5} shadow="md" borderWidth="1px" flex="1" borderRadius="md">
							<Heading fontSize="xl">{post.title}</Heading>
							<Text mt={4}>{post.textSnippet}</Text>
						</Box>
					))}
					{data && (
						<Flex>
							<Button
								mx="auto"
								mb={5}
								onClick={() => {
									setVariables((prevState) => ({
										...prevState,
										cursor: data.posts[data.posts.length - 1].createdAt,
									}));
								}}>
								Load more...
							</Button>
						</Flex>
					)}
				</Stack>
			)}
		</Layout>
	);
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
