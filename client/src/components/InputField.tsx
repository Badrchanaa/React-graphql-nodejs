import {
	FormControl,
	FormLabel,
	Input,
	FormErrorMessage,
	FormErrorIcon,
} from '@chakra-ui/react';
import { useField } from 'formik';
import React, { InputHTMLAttributes } from 'react';

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
	name: string;
	label: string;
};

export const InputField: React.FC<InputFieldProps> = ({
	label,
	size: _,
	...props
}) => {
	const [field, { error }] = useField(props);
	return (
		<FormControl isInvalid={!!error}>
			<FormLabel htmlFor={field.name}>{label}</FormLabel>
			<Input
				{...field}
				{...props}
				placeholder={props.placeholder}
				id={field.name}
			/>
			{error && <FormErrorMessage><FormErrorIcon />{error}</FormErrorMessage>}
		</FormControl>
	);
};
