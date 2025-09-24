"use client";

import { Controller, useFormContext } from "react-hook-form";
import FileInput from "@/components/form/input/FileInput";
import Label from "@/components/form/Label";
import React from "react";

interface RHFFileInputProps {
	name: string;
	label?: string;
	className?: string;
	multiple?: boolean;
	accept?: string;
	disabled?: boolean;
}

const RHFFileInput: React.FC<RHFFileInputProps> = ({
	name,
	label,
	className,
	multiple = false,
	accept,
	disabled,
}) => {
	const { control } = useFormContext();

	return (
		<div className="space-y-1.5">
			{label && <Label htmlFor={name}>{label}</Label>}

			<Controller
				name={name}
				control={control}
				defaultValue={multiple ? [] : null}
				render={({ field, fieldState }) => {
					const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
						const files = e.target.files;
						if (!files || files.length === 0) {
							field.onChange(multiple ? [] : null);
							return;
						}
						field.onChange(multiple ? Array.from(files) : files[0]);
					};

					return (
						<>
							<FileInput
								className={className}
								multiple={multiple}
								accept={accept}
								disabled={disabled}
								onChange={handleChange}
							/>

							{multiple
								? Array.isArray(field.value) &&
								  field.value.length > 0 && (
										<p className="mt-1 text-xs text-gray-500">
											{field.value.length} archivo(s):{" "}
											{field.value.map((f: File) => f.name).join(", ")}
										</p>
								  )
								: field.value &&
								  typeof field.value === "object" &&
								  "name" in field.value && (
										<p className="mt-1 text-xs text-gray-500">
											Seleccionado: {(field.value as File).name}
										</p>
								  )}

							{fieldState.error?.message && (
								<p className="mt-1 text-xs text-error-500">
									{fieldState.error.message}
								</p>
							)}
						</>
					);
				}}
			/>
		</div>
	);
};

export default RHFFileInput;
