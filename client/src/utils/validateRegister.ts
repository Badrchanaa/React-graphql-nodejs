import { RegisterInput } from "../generated/graphql";
import { validEmail } from "./validEmail";

export const validateRegister = ({ username, password, email }: RegisterInput) => {
  
	if (!validEmail(email))
		return { email: 'invalid email!' };

	if (!username || !/^[\w](?!.*?\.{2})[\w.]{1,28}[\w]$/.test(username))
		return { username: 'invalid username!' };

	if (!password || password.length <= 7)
		return { password: 'password must be at least 8 characters!' };

	else if (password.length > 40)
		return {password: 'too long!'}

};
