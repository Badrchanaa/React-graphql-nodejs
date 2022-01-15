import { Button } from '@chakra-ui/react';
import { useState } from 'react';
import { useQuery } from 'urql';
import NavBar from '../components/NavBar';

const Index = () => {


	return (
		<>
			<NavBar />
			<div>
				Hello !
			</div>
		</>
	);
};

export default Index;
