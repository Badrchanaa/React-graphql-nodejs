import React from 'react';
import { Formik, Form } from 'formik';
import { Box, Button, Flex, Link } from '@chakra-ui/react';
import Layout from '../components/Layout';
import { InputField } from '../components/InputField';
import { useRouter } from 'next/router';
import { createUrqlClient } from '../utils/createUrqlClient';
import { withUrqlClient } from 'next-urql';
import { useCreatePostMutation } from '../generated/graphql';
import { useAuth } from '../hooks/useAuth';

const CreatePost: React.FC<{}> = ({}) => {
	const router = useRouter();
  useAuth(router);
	const [, createPost] = useCreatePostMutation();
	return (
		<Layout variant="small">
			<Formik
				initialValues={{ title: '', text: '' }}
				onSubmit={async (values, { setErrors }) => {
					const {error} = await createPost({ input: values });
          if(!error) router.push('/');
				}}>
				{({ isSubmitting }) => (
					<Form>
						<InputField placeholder="title" name="title" label="Title" />
						<Box mt={4}>
							<InputField
								textarea
								placeholder="content..."
								name="text"
								label="Body"
							/>
						</Box>
						<Button
							mt={4}
							colorScheme="teal"
							type="submit"
							isLoading={isSubmitting}>
							create post
						</Button>
					</Form>
				)}
			</Formik>
		</Layout>
	);
};

export default withUrqlClient(createUrqlClient)(CreatePost);
