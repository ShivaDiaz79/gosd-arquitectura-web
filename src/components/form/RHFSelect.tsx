"use client";

import { Controller, useFormContext, get } from "react-hook-form";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import { ChevronDownIcon } from "@/icons";

export interface Option {
	value: string;
	label: string;
}

interface RHFSelectProps extends React.HTMLAttributes<HTMLDivElement> {
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
	...rest
}) => {
	const {
		control,
		formState: { errors },
	} = useFormContext();

	const err = get(errors, name) as { message?: string } | undefined;
	const hintId = `${name}-hint`;

	return (
		<div className="space-y-1.5" {...rest}>
			{label && <Label htmlFor={name}>{label}</Label>}

			<Controller
				name={name}
				control={control}
				render={({ field }) => (
					<div className="relative">
						<Select
							options={options}
							placeholder={placeholder}
							onChange={(val: any) =>
								field.onChange(typeof val === "string" ? val : val?.value ?? "")
							}
							className={className}
							aria-invalid={!!err || undefined}
							aria-describedby={err ? hintId : undefined}
						/>
						<span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
							<ChevronDownIcon />
						</span>
					</div>
				)}
			/>

			{err?.message && (
				<p id={hintId} className="text-xs text-red-600">
					{err.message}
				</p>
			)}

			{disabled && !err?.message && (
				<p className="text-xs text-gray-500">Campo deshabilitado</p>
			)}
		</div>
	);
};

export default RHFSelect;
