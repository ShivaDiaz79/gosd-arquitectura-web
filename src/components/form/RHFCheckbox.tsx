"use client";

import { Controller, useFormContext } from "react-hook-form";
import Checkbox from "@/components/form/input/Checkbox";

interface RHFCheckboxProps {
	name: string;
	label?: string;
	disabled?: boolean;
	className?: string;
}

const RHFCheckbox: React.FC<RHFCheckboxProps> = ({
	name,
	label,
	disabled,
	className,
}) => {
	const { control } = useFormContext();

	return (
		<Controller
			name={name}
			control={control}
			defaultValue={false}
			render={({ field }) => (
				<Checkbox
					id={name}
					label={label}
					checked={!!field.value}
					onChange={(checked) => field.onChange(checked)}
					disabled={disabled}
					className={className}
				/>
			)}
		/>
	);
};

export default RHFCheckbox;
