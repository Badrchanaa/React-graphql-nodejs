import { ChevronUpIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { Flex, IconButton, Text } from '@chakra-ui/react';
import React from 'react'
import { useVoteMutation } from '../generated/graphql';

interface UpdootProps {
  points: number;
  postId: number;
  voteStatus?: number | null;
}

export const Updoot: React.FC<UpdootProps> = ({points, postId, voteStatus}) => {

    const [, vote] = useVoteMutation();

    return (
      <Flex direction="column" alignItems="center" justifyContent="center">
				<IconButton
          onClick={() => {
            if(voteStatus === 1) return;
            vote({
              postId,
              value: 1
            });
          }}
          colorScheme={voteStatus === 1 ? 'green' : undefined}
					variant={voteStatus === 1 ? 'solid': 'ghost'}
          aria-label="Up vote"
					isRound
					icon={<ChevronUpIcon w={8} h={8} />}
				/>
				<Text fontSize="xl">{points}</Text>
				<IconButton
          onClick={() => {
            if(voteStatus === -1) return;
            vote({
              postId,
              value: -1
            });
          }}
					aria-label="Down vote"
          colorScheme={voteStatus === -1 ? 'red' : undefined}
					variant={voteStatus === -1 ? 'solid': 'ghost'}
					isRound
					icon={<ChevronDownIcon w={8} h={8} />}
				/>
			</Flex>
    );
}