"use client";

import { Controller, useFormContext } from "react-hook-form";
import FileInput from "@/components/form/input/FileInput";
import Label from "@/components/form/Label";

interface RHFFileInputProps {
	name: string;
	label?: string;
	className?: string;
}

const RHFFileInput: React.FC<RHFFileInputProps> = ({
	name,
	label,
	className,
}) => {
	const { control } = useFormContext();

	return (
		<div className="space-y-1.5">
			{label && <Label htmlFor={name}>{label}</Label>}
			<Controller
				name={name}
				control={control}
				defaultValue={null}
				render={({ field }) => (
					<>
						<FileInput
							className={className}
							onChange={(e) => {
								const files = e.target.files;
								field.onChange(files && files.length ? files[0] : null); // un solo archivo (tu FileInput no expone 'multiple')
							}}
						/>
						{field.value &&
							typeof field.value === "object" &&
							"name" in field.value && (
								<p className="text-xs text-gray-500 mt-1">
									Seleccionado: {(field.value as File).name}
								</p>
							)}
					</>
				)}
			/>
		</div>
	);
};

export default RHFFileInput;
