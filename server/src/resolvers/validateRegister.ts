import { RegisterInput } from './InputTypes';

export const validateRegister = ({
	username,
	password,
	email,
}: RegisterInput) => {
	if (!email || !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email))
		return [
			{
				field: 'email',
				message: 'invalid email.',
			},
		];
	if (!username || username.length <= 2 || !/^[a-zA-Z0-9]+$/.test(username))
		return [
			{
				field: 'username',
				message: 'length must be greater than 2.',
			},
		];

	if (!password || password.length <= 7)
		return [
			{
				field: 'password',
				message: 'length must be greater than 7.',
			},
		];
	return null;
};
