import { InputType, Field } from "type-graphql";

@InputType()
export class RegisterInput {
	@Field()
	username: string;

	@Field()
	password: string;

	@Field()
	email: string;
}

@InputType()
export class PostInput {
	@Field()
	title: string;

	@Field()
	text: string;
}

@InputType()
export class LoginInput {
	@Field()
	username: string;

	@Field()
	password: string;
}
