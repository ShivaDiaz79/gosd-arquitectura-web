// src/components/form/RHFInput.tsx
"use client";

import { FC } from "react";
import { get, useFormContext, RegisterOptions } from "react-hook-form";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";

interface RHFInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	name: string;
	label?: string;
	rules?: RegisterOptions; // <— ahora soporta reglas
}

const RHFInput: FC<RHFInputProps> = ({ name, label, rules, ...rest }) => {
	const {
		register,
		formState: { errors },
	} = useFormContext();
	const err = get(errors, name) as { message?: string } | undefined;

	return (
		<div className="space-y-1.5">
			{label && <Label htmlFor={name}>{label}</Label>}
			<Input
				id={name}
				{...register(name, rules)}
				error={Boolean(err)}
				hint={err?.message}
				{...rest}
			/>
		</div>
	);
};

export default RHFInput;
