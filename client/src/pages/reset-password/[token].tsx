import { Alert, AlertIcon, Box, Button } from '@chakra-ui/react';
import { Formik, Form } from 'formik';
import { NextPage } from 'next';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { InputField } from '../../components/InputField';
import Wrapper from '../../components/Wrapper';
import { useChangePasswordMutation } from '../../generated/graphql';
import { createUrqlClient } from '../../utils/createUrqlClient';
import { toErrorMap } from '../../utils/toErrorMap';
import { validPassword } from '../../utils/validPassword';

const ResetPassword: NextPage = () => {
	const router = useRouter();
	const [tokenError, setTokenError] = useState('');
	const [, changePassword] = useChangePasswordMutation();

	const validateChangePassword = (values: {
		password: string;
		confirmPassword: string;
	}) => {
		if (!validPassword(values.password)) {
			return { password: 'Password must contain at least 8 characters' };
		} else if (values.password !== values.confirmPassword) {
			return { confirmPassword: 'Passwords does not match' };
		}
	};

	return (
		<Wrapper variant="small">
			<Formik
        validateOnChange={false}
				validate={validateChangePassword}
				initialValues={{ password: '', confirmPassword: '' }}
				onSubmit={async (values, { setErrors }) => {
					const response = await changePassword({
						token: typeof router.query.token === 'string' ? router.query.token : '',
						newPassword: values.password,
					});

					if (response.data?.changePassword.errors) {
						const errorMap = toErrorMap(response.data.changePassword.errors);
						if ('token' in errorMap) {
							setTokenError(errorMap.token);
						}
						setErrors(errorMap);
					} else if (response.data?.changePassword.user) {
						router.push('/');
					}
					return true;
				}}>
				{({ isSubmitting }) => (
					<Form>
						<InputField
							placeholder="password"
							name="password"
							label="New password"
							type="password"
							autoComplete="off"
						/>
						<Box mt={4}>
							<InputField
								placeholder="password"
								name="confirmPassword"
								label="Confirm password"
								type="password"
								autoComplete="off"
							/>
						</Box>
						{tokenError && (
							<Alert mt={4} borderRadius={5} status="error" variant='left-accent'>
								<AlertIcon />
								{tokenError}
							</Alert>
						)}
						<Button
							mt={4}
							colorScheme="teal"
							type="submit"
							isLoading={isSubmitting}>
							Change password
						</Button>
					</Form>
				)}
			</Formik>
		</Wrapper>
	);
};


export default withUrqlClient(createUrqlClient)(ResetPassword);
