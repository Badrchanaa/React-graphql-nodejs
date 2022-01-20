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
	if (!username || !/^[\w](?!.*?\.{2})[\w.]{1,28}[\w]$/.test(username))
		return [
			{
				field: 'username',
				message: 'invalid username.',
			},
		];

	if (!password || password.length <= 7)
		return [
			{
				field: 'password',
				message: 'too short!',
			},
		];
	else if (password.length > 40)
		return [
			{
				field: 'password',
				message: 'too long!',
			},
		];
	return null;
};
