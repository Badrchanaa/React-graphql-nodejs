import {
	FormControl,
	FormLabel,
	Input,
  Textarea,
	FormErrorMessage,
	FormErrorIcon,
} from '@chakra-ui/react';
import { useField } from 'formik';
import React, { InputHTMLAttributes, ReactComponentElement } from 'react';

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
	name: string;
	label: string;
  textarea?: boolean;
};

export const InputField: React.FC<InputFieldProps> = ({
	label,
  textarea,
	size: _,
	...props
}) => {
	const [field, { error }] = useField(props);

  let InputComponent: any = Input

  if(textarea) {
    InputComponent = Textarea
  }

	return (
		<FormControl isInvalid={!!error}>
			<FormLabel htmlFor={field.name}>{label}</FormLabel>
			<InputComponent
				{...field}
				{...props}
				placeholder={props.placeholder}
				id={field.name}
			/>
			{error && <FormErrorMessage><FormErrorIcon />{error}</FormErrorMessage>}
		</FormControl>
	);
};
