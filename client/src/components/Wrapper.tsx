import { Box } from '@chakra-ui/react';
import React from 'react';

export type WrapperVariant = 'small' | 'medium';

interface wrapperProps {
	variant?: WrapperVariant;
}

const Wrapper: React.FC<wrapperProps> = ({ children, variant = 'medium' }) => {
	return (
		<Box
			mt={8}
			mx="auto"
			maxW={variant === 'medium' ? '800px' : '400px'}
			w="100%">
			{children}
		</Box>
	);
};

export default Wrapper;
