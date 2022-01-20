import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import { Box, Flex, Heading, IconButton, Spacer, Text } from '@chakra-ui/react';
import React from 'react';
import { PostSnippetFragment } from '../generated/graphql';
import { Updoot } from './Updoot';

interface PostProps {
  post: PostSnippetFragment;
}

export const Post: React.FC<PostProps> = ({
  post
}) => {
	return (
		<Flex p={5} shadow="md" borderWidth="1px" flex="1" borderRadius="md">
			<Box>
				<Heading fontSize="xl">{post.title}</Heading>
				<Text>Posted by {post.creator.username}</Text>
				<Text mt={4}>{post.textSnippet}</Text>
			</Box>
			<Spacer />
			<Updoot postId={post.id} voteStatus={post.voteStatus} points={post.points} />
		</Flex>
	);
};
