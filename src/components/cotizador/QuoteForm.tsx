"use client";

import { FormProvider, useForm, Controller, useWatch } from "react-hook-form";
import RHFInput from "@/components/form/RHFInput";
import RHFMultiSelect from "@/components/form/RHFMultiSelect";
import RHFCheckbox from "@/components/form/RHFCheckbox";
import RHFRadioGroup from "@/components/form/RHFRadioGroup";
import RHFFileInput from "@/components/form/RHFFileInput";

import Label from "@/components/form/Label";
import Select from "@/components/form/Select";

import {
	SERVICIO_OPCIONES,
	CATEGORIA_L1,
	CATEGORIA_L2,
	CATEGORIA_L3,
	ENTREGABLES_DISENO,
	EJECUTABLES_CONSTRUCCION,
} from "@/lib/constants/cotizador";
import { keyFromCategoria } from "@/lib/helpers/cotizador";
import Resumen from "./Resumen";
import { useEffect } from "react";

type FormValues = {
	servicio: "diseno" | "construccion" | "diseno_construccion" | "";
	categoria_l1?: string;
	categoria_l2?: string;
	categoria_l3?: string;
	superficie_m2?: number | string;

	todo_diseno?: boolean;
	entregables?: string[];

	todo_construccion?: boolean;
	ejecutables?: string[];

	adjunto?: File | null;

	otros_descripcion?: string;
};

const QuoteForm: React.FC = () => {
	const methods = useForm<FormValues>({
		defaultValues: {
			servicio: "" as any,
			categoria_l1: "",
			categoria_l2: "",
			categoria_l3: "",
			superficie_m2: "",
			todo_diseno: false,
			entregables: [],
			todo_construccion: false,
			ejecutables: [],
			adjunto: null,
			otros_descripcion: "",
		},
	});

	const { handleSubmit, control, setValue, reset, watch } = methods;

	const l1 = useWatch({ control, name: "categoria_l1" });
	const l2 = useWatch({ control, name: "categoria_l2" });
	const servicio = useWatch({ control, name: "servicio" });
	const todoDiseno = useWatch({ control, name: "todo_diseno" });
	const todoConstruccion = useWatch({ control, name: "todo_construccion" });
	const ejecutables = useWatch({ control, name: "ejecutables" }) as string[];

	const subOptionsL2 = CATEGORIA_L2[l1 || ""] || [];
	const subOptionsL3 = CATEGORIA_L3[keyFromCategoria(l1, l2)] || [];

	const onChangeL1 = (val: string) => {
		setValue("categoria_l1", val);
		setValue("categoria_l2", "");
		setValue("categoria_l3", "");
	};

	const onChangeL2 = (val: string) => {
		setValue("categoria_l2", val);
		setValue("categoria_l3", "");
	};

	const showDiseno =
		servicio === "diseno" || servicio === "diseno_construccion";
	const showConstruccion =
		servicio === "construccion" || servicio === "diseno_construccion";
	const showOtrosInput =
		Array.isArray(ejecutables) && ejecutables.includes("otros");

	useEffect(() => {
		if (todoDiseno) setValue("entregables", []);
	}, [todoDiseno, setValue]);

	useEffect(() => {
		if (todoConstruccion) setValue("ejecutables", []);
	}, [todoConstruccion, setValue]);

	const onSubmit = async (data: FormValues) => {
		console.log("Cotización:", data);
		alert(
			"Cotización generada (ver consola). Conecta Firestore para guardarla si lo deseas."
		);
	};

	return (
		<FormProvider {...methods}>
			<form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
				<section className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
					<h3 className="mb-4 text-lg font-semibold">1) Tipo de servicio</h3>
					<RHFRadioGroup
						name="servicio"
						label="Primera selección"
						options={SERVICIO_OPCIONES}
						inline
					/>
				</section>

				<section className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
					<h3 className="mb-4 text-lg font-semibold">2) Categoría</h3>

					<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
						<Controller
							name="categoria_l1"
							control={control}
							render={({ field }) => (
								<div className="space-y-1.5">
									<Label>Categoría (Nivel 1)</Label>
									<Select
										options={CATEGORIA_L1.map(({ value, label }) => ({
											value,
											label,
										}))}
										placeholder="Elige categoría"
										defaultValue={field.value ?? ""}
										onChange={(val) => onChangeL1(val)}
									/>
								</div>
							)}
						/>

						<Controller
							name="categoria_l2"
							control={control}
							render={({ field }) => (
								<div className="space-y-1.5">
									<Label>Categoría (Nivel 2)</Label>
									<select
										className="h-11 w-full appearance-none rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
										value={field.value || ""}
										onChange={(e) => onChangeL2(e.target.value)}
										disabled={subOptionsL2.length === 0}
									>
										<option value="" disabled>
											{subOptionsL2.length
												? "Selecciona subcategoría"
												: "No aplica"}
										</option>
										{subOptionsL2.map((o) => (
											<option key={o.value} value={o.value}>
												{o.label}
											</option>
										))}
									</select>
								</div>
							)}
						/>

						<Controller
							name="categoria_l3"
							control={control}
							render={({ field }) => (
								<div className="space-y-1.5">
									<Label>Categoría (Nivel 3)</Label>
									<select
										className="h-11 w-full appearance-none rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
										value={field.value || ""}
										onChange={(e) => field.onChange(e.target.value)}
										disabled={subOptionsL3.length === 0}
									>
										<option value="" disabled>
											{subOptionsL3.length ? "Selecciona nivel 3" : "No aplica"}
										</option>
										{subOptionsL3.map((o) => (
											<option key={o.value} value={o.value}>
												{o.label}
											</option>
										))}
									</select>
								</div>
							)}
						/>
					</div>

					<div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
						<RHFInput
							name="superficie_m2"
							label="Superficie (m²)"
							type="number"
							min={0}
							step="0.01"
							placeholder="0.00"
						/>

						<RHFFileInput
							name="adjunto"
							label="Adjuntar referencia (opcional)"
						/>
					</div>
				</section>

				{showDiseno && (
					<section className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
						<h3 className="mb-4 text-lg font-semibold">
							3) Entregables de Diseño
						</h3>

						<div className="mb-3 flex items-center gap-4">
							<RHFCheckbox name="todo_diseno" label="TODO / Completo" />
							<p className="text-xs text-gray-500">
								Si activas esto, los entregables específicos se calcularán según
								categoría y superficie.
							</p>
						</div>

						<RHFMultiSelect
							name="entregables"
							label="Selecciona entregables (si NO es todo/completo)"
							options={ENTREGABLES_DISENO}
							disabled={!!todoDiseno}
						/>
					</section>
				)}

				{showConstruccion && (
					<section className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
						<h3 className="mb-4 text-lg font-semibold">
							4) Ejecutables de Construcción
						</h3>

						<div className="mb-3 flex items-center gap-4">
							<RHFCheckbox name="todo_construccion" label="TODO / Completo" />
							<p className="text-xs text-gray-500">
								Si activas esto, los ejecutables específicos se calcularán según
								categoría y superficie.
							</p>
						</div>

						<RHFMultiSelect
							name="ejecutables"
							label="Selecciona ejecutables (si NO es todo/completo)"
							options={EJECUTABLES_CONSTRUCCION}
							disabled={!!todoConstruccion}
						/>

						{showOtrosInput && (
							<div className="mt-4">
								<RHFInput
									name="otros_descripcion"
									label="OTROS — Describe lo que deseas adicionar (revisado por supervisor)"
									placeholder="Ej.: Ascensor panorámico, domótica adicional, etc."
								/>
							</div>
						)}
					</section>
				)}

				<Resumen />

				<div className="flex items-center justify-end gap-3">
					<button
						type="button"
						onClick={() => reset()}
						className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
					>
						Limpiar
					</button>
					<button
						type="submit"
						className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
					>
						Generar Cotización
					</button>
				</div>
			</form>
		</FormProvider>
	);
};

export default QuoteForm;
