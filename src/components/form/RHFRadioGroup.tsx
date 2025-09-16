"use client";

import { Controller, useFormContext } from "react-hook-form";
import RadioSm from "@/components/form/input/RadioSm";
import Label from "@/components/form/Label";

interface Option {
	value: string;
	label: string;
}

interface RHFRadioGroupProps {
	name: string;
	label?: string;
	options: Option[];
	inline?: boolean;
	className?: string;
}

const RHFRadioGroup: React.FC<RHFRadioGroupProps> = ({
	name,
	label,
	options,
	inline = true,
	className,
}) => {
	const { control } = useFormContext();

	return (
		<div className={className}>
			{label && <Label htmlFor={name}>{label}</Label>}
			<Controller
				name={name}
				control={control}
				render={({ field }) => (
					<div className={inline ? "flex flex-wrap gap-4" : "space-y-2"}>
						{options.map((opt, idx) => (
							<RadioSm
								key={opt.value}
								id={`${name}-${idx}`}
								name={name}
								value={opt.value}
								checked={field.value === opt.value}
								label={opt.label}
								onChange={(val) => field.onChange(val)}
							/>
						))}
					</div>
				)}
			/>
		</div>
	);
};

export default RHFRadioGroup;
