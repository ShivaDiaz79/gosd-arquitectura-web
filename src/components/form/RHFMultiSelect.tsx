"use client";

import { Controller, useFormContext } from "react-hook-form";
import MultiSelect from "@/components/form/MultiSelect";

export interface MSOption {
	value: string;
	text: string;
	selected?: boolean;
}

interface RHFMultiSelectProps {
	name: string;
	label: string;
	options: MSOption[];
	disabled?: boolean;
}

const RHFMultiSelect: React.FC<RHFMultiSelectProps> = ({
	name,
	label,
	options,
	disabled,
}) => {
	const { control } = useFormContext();

	return (
		<Controller
			name={name}
			control={control}
			defaultValue={[]}
			render={({ field }) => (
				<MultiSelect
					key={
						(Array.isArray(field.value) ? field.value.join("|") : "") +
						String(disabled)
					}
					label={label}
					options={options.map((o) => ({
						value: o.value,
						text: o.text,
						selected: Array.isArray(field.value)
							? field.value.includes(o.value)
							: false,
					}))}
					defaultSelected={
						(Array.isArray(field.value) ? field.value : []) as string[]
					}
					onChange={(selected) => field.onChange(selected)}
					disabled={disabled}
				/>
			)}
		/>
	);
};

export default RHFMultiSelect;
