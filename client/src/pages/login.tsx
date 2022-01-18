import React from 'react';
import { Formik, Form } from 'formik';
import { Box, Button, Flex, Link } from '@chakra-ui/react';
import Wrapper from '../components/Wrapper';
import { InputField } from '../components/InputField';
import { useLoginMutation } from '../generated/graphql';
import { toErrorMap } from '../utils/toErrorMap';
import { useRouter } from 'next/router';
import { createUrqlClient } from '../utils/createUrqlClient';
import { withUrqlClient } from 'next-urql';
import NextLink from 'next/link';

interface loginProps {}

const Login: React.FC<loginProps> = ({}) => {
	const router = useRouter();
	const [, login] = useLoginMutation();
	return (
		<Wrapper variant="small">
			<Formik
				initialValues={{ username: '', password: '' }}
				onSubmit={async (values, { setErrors }) => {
					const response = await login({ options: values });
					if (response.data?.login.errors) {
						setErrors(toErrorMap(response.data.login.errors));
					} else if (response.data?.login.user) {
						router.push('/');
					}
					return true;
				}}>
				{({ isSubmitting }) => (
					<Form>
						<InputField
							placeholder="username"
							name="username"
							label="Username"
						/>
						<Box mt={4}>
							<InputField
								placeholder="password"
								name="password"
								label="Password"
								type="password"
							/>
						</Box>
						<Flex mt={1}>
            <NextLink href="/forgot-password">
							<Link ml='auto' mr={1}>Forgot password ?</Link>
						</NextLink>
            </Flex>
						<Button
							mt={4}
							colorScheme="teal"
							type="submit"
							isLoading={isSubmitting}>
							Register
						</Button>
					</Form>
				)}
			</Formik>
		</Wrapper>
	);
};

export default withUrqlClient(createUrqlClient)(Login);
