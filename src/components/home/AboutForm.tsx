"use client";

import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import RHFInput from "@/components/form/RHFInput";
import { useAboutContent } from "@/hooks/useAboutContent";
import type { AboutContent } from "@/lib/types/nosotros.type";
import { useEffect, useState } from "react";

type FormValues = AboutContent;

export default function AboutForm() {
	const { data, loading, saving, error, save, reload } = useAboutContent();

	const methods = useForm<FormValues>({
		defaultValues: {
			title: "",
			intro: "",
			stats: [
				{ k: "", v: "" },
				{ k: "", v: "" },
				{ k: "", v: "" },
				{ k: "", v: "" },
			],
		},
	});

	const { control, reset, handleSubmit } = methods;
	const { fields, append, remove } = useFieldArray({ control, name: "stats" });
	const [msg, setMsg] = useState<string | null>(null);

	useEffect(() => {
		if (!loading && data) reset(data);
	}, [loading, data, reset]);

	const onSubmit = handleSubmit(async (vals) => {
		setMsg(null);
		try {
			await save(vals);
			setMsg("Guardado con éxito.");
		} catch {
			setMsg("Error al guardar. Revisá la consola.");
		}
	});

	return (
		<FormProvider {...methods}>
			<form onSubmit={onSubmit} className="grid grid-cols-1 gap-6 max-w-4xl">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<RHFInput name="title" label="Título" placeholder="Nosotros" />
					<RHFInput
						name="intro"
						label="Introducción"
						placeholder="Texto descriptivo…"
					/>
				</div>

				<div>
					<div className="text-sm font-medium mb-2">Indicadores (stats)</div>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{fields.map((f, idx) => (
							<div key={f.id} className="grid grid-cols-2 gap-3">
								<RHFInput
									name={`stats.${idx}.k`}
									label="Clave (k)"
									placeholder="+12"
								/>
								<RHFInput
									name={`stats.${idx}.v`}
									label="Valor (v)"
									placeholder="años construyendo"
								/>
								<div className="col-span-2">
									<button
										type="button"
										onClick={() => remove(idx)}
										className="text-xs text-red-600 hover:underline"
									>
										Eliminar
									</button>
								</div>
							</div>
						))}
					</div>

					<div className="mt-3">
						<button
							type="button"
							onClick={() => append({ k: "", v: "" })}
							className="inline-flex items-center rounded-md px-4 py-2 text-sm border border-black/15 hover:bg-black/5"
						>
							Agregar indicador
						</button>
					</div>
				</div>

				<div className="flex items-center gap-3">
					<button
						type="submit"
						disabled={saving}
						className="inline-flex items-center rounded-md px-5 py-2.5 text-sm bg-black text-white hover:opacity-90 disabled:opacity-60"
					>
						{saving ? "Guardando…" : "Guardar cambios"}
					</button>
					<button
						type="button"
						onClick={() => reload()}
						className="inline-flex items-center rounded-md px-5 py-2.5 text-sm border border-black/15 hover:bg-black/5"
					>
						Recargar
					</button>
					{error && <span className="text-sm text-red-600">{error}</span>}
					{msg && <span className="text-sm text-green-600">{msg}</span>}
				</div>
			</form>
		</FormProvider>
	);
}
