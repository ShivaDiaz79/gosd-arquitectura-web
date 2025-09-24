// components/admin/ServicesForm.tsx
"use client";

import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import RHFInput from "@/components/form/RHFInput";
import { useServicesContent } from "@/hooks/useServicesContent";
import type { ServicesContent } from "@/lib/types/services.type";
import { useEffect, useState } from "react";

export default function ServicesForm() {
	const { data, loading, saving, error, save, reload } = useServicesContent();

	const methods = useForm<ServicesContent>({
		defaultValues: {
			heading: "Servicios",
			ctaText: "Ver todos",
			ctaHref: "/servicios",
			items: [
				{ title: "", desc: "", href: "" },
				{ title: "", desc: "", href: "" },
				{ title: "", desc: "", href: "" },
				{ title: "", desc: "", href: "" },
			],
		},
	});

	const { control, reset, handleSubmit } = methods;
	const { fields, append, remove, move } = useFieldArray({
		control,
		name: "items",
	});
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
			<form onSubmit={onSubmit} className="grid grid-cols-1 gap-6 max-w-5xl">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<RHFInput
						name="heading"
						label="Título sección"
						placeholder="Servicios"
					/>
					<RHFInput name="ctaText" label="Texto CTA" placeholder="Ver todos" />
					<RHFInput name="ctaHref" label="Link CTA" placeholder="/servicios" />
				</div>

				<div>
					<div className="text-sm font-medium mb-2">Tarjetas</div>
					<div className="space-y-4">
						{fields.map((f, idx) => (
							<div
								key={f.id}
								className="rounded-lg border border-black/10 dark:border-white/10 p-4"
							>
								<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
									<RHFInput
										name={`items.${idx}.title`}
										label="Título"
										placeholder="Diseño y arquitectura"
									/>
									<RHFInput
										name={`items.${idx}.desc`}
										label="Descripción"
										placeholder="Anteproyecto, ejecutivo…"
									/>
									<RHFInput
										name={`items.${idx}.href`}
										label="Link"
										placeholder="/servicios/diseno-arquitectonico"
									/>
								</div>
								<div className="mt-3 flex gap-3">
									<button
										type="button"
										onClick={() => remove(idx)}
										className="text-xs text-red-600 hover:underline"
									>
										Eliminar
									</button>
									{idx > 0 && (
										<button
											type="button"
											onClick={() => move(idx, idx - 1)}
											className="text-xs hover:underline"
										>
											Subir
										</button>
									)}
									{idx < fields.length - 1 && (
										<button
											type="button"
											onClick={() => move(idx, idx + 1)}
											className="text-xs hover:underline"
										>
											Bajar
										</button>
									)}
								</div>
							</div>
						))}
					</div>

					<div className="mt-3">
						<button
							type="button"
							onClick={() => append({ title: "", desc: "", href: "" })}
							className="inline-flex items-center rounded-md px-4 py-2 text-sm border border-black/15 hover:bg-black/5"
						>
							Agregar tarjeta
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
