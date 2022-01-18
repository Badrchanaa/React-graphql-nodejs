import { useState } from 'react';
import { Formik, Form } from 'formik';
import { Alert, AlertIcon, Box, Button, Link } from '@chakra-ui/react';
import Wrapper from '../components/Wrapper';
import { InputField } from '../components/InputField';
import { useForgotPasswordMutation } from '../generated/graphql';
import { createUrqlClient } from '../utils/createUrqlClient';
import { withUrqlClient } from 'next-urql';
import NextLink from 'next/link';

const ForgotPassword: React.FC<{}> = ({}) => {
	const [complete, setComplete] = useState(false);
	const [, resetPassword] = useForgotPasswordMutation();
	return (
		<Wrapper variant="small">
			<Formik
				initialValues={{ email: '' }}
				onSubmit={async (values) => {
					await resetPassword({ email: values.email });
					setComplete(true);
					return true;
				}}>
				{({ isSubmitting }) =>
					complete ? (
						<Alert
							mt={4}
							borderRadius={5}
							status="success"
							variant="left-accent">
							<AlertIcon />
              <Box>
							We will send you an email shortly if an account with this email
							address exists.{' '}
							<NextLink href='/'>
								<Link textColor='blue.700'>Home page</Link>
							</NextLink>
              </Box>
						</Alert>
					) : (
						<Form>
							<InputField
								placeholder="email"
								name="email"
								label="Email"
								type="email"
							/>
							<Button
								mt={4}
								colorScheme="teal"
								type="submit"
								isLoading={isSubmitting}>
								Send verification email
							</Button>
						</Form>
					)
				}
			</Formik>
		</Wrapper>
	);
};

export default withUrqlClient(createUrqlClient)(ForgotPassword);
