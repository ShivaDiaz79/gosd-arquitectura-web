"use client";

import { Controller, useFormContext } from "react-hook-form";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";

export interface Option {
	value: string;
	label: string;
}

interface RHFSelectProps {
	name: string;
	label?: string;
	options: Option[];
	placeholder?: string;
	className?: string;
	disabled?: boolean;
}

const RHFSelect: React.FC<RHFSelectProps> = ({
	name,
	label,
	options,
	placeholder,
	className,
	disabled,
}) => {
	const { control } = useFormContext();

	return (
		<div className="space-y-1.5">
			{label && <Label htmlFor={name}>{label}</Label>}
			<Controller
				name={name}
				control={control}
				render={({ field }) => (
					<Select
						options={options}
						placeholder={placeholder}
						defaultValue={(field.value as string) ?? ""}
						onChange={(val) => field.onChange(val)}
						className={className}
					/>
				)}
			/>
			{disabled && <p className="text-xs text-gray-500">Campo deshabilitado</p>}
		</div>
	);
};

export default RHFSelect;
