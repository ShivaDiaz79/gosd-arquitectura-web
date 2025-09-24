"use client";

import { useEffect, useState } from "react";
import {
	FormProvider,
	useFieldArray,
	useForm,
	useFormContext,
} from "react-hook-form";
import RHFInput from "@/components/form/RHFInput";
import Button from "@/components/ui/button/Button";
import { useProcesoContent } from "@/hooks/useProcesoContent";
import type { ProcesoContent, ProcesoPaso } from "@/lib/types/proceso.type";

type FormValues = ProcesoContent;

export default function ProcesoForm() {
	const { data, loading, saving, error, save, reload } = useProcesoContent();

	const methods = useForm<FormValues>({
		defaultValues: {
			title: "Proceso",
			steps: [
				{ n: "01", t: "", d: "" },
				{ n: "02", t: "", d: "" },
			],
		},
		mode: "onTouched",
	});

	const { control, register } = methods;
	const { fields, append, remove, move } = useFieldArray({
		control,
		name: "steps",
	});

	const [msg, setMsg] = useState<string | null>(null);

	useEffect(() => {
		if (!loading && data) methods.reset(data);
	}, [loading, data, methods]);

	const onSubmit = methods.handleSubmit(async (vals) => {
		setMsg(null);
		try {
			await save(vals);
			setMsg("Guardado con éxito.");
		} catch {
			setMsg("Error al guardar. Revisa la consola.");
		}
	});

	function addStep() {
		const idx = fields.length;
		append({ n: String(idx + 1).padStart(2, "0"), t: "", d: "" });
	}

	return (
		<FormProvider {...methods}>
			<form
				onSubmit={onSubmit}
				className="mx-auto max-w-6xl grid grid-cols-1 gap-6 md:grid-cols-2 px-4 sm:px-6 lg:px-0"
			>
				<div className="space-y-6">
					<RHFInput
						name="title"
						label="Título de la sección"
						placeholder="Proceso"
					/>

					<div className="space-y-4">
						<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
							<h4 className="text-sm font-semibold">Pasos</h4>
							<div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
								<Button
									type="button"
									onClick={addStep}
									className="w-full sm:w-auto"
								>
									Agregar paso
								</Button>
								<button
									type="button"
									onClick={() => reload()}
									className="inline-flex w-full items-center justify-center rounded-md px-3 py-2 text-xs border border-black/15 hover:bg-black/5 sm:w-auto"
								>
									Recargar
								</button>
							</div>
						</div>

						<div className="space-y-4">
							{fields.map((f, i) => (
								<div
									key={f.id}
									className="rounded-lg border border-gray-200 dark:border-white/10 p-4"
								>
									<div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
										<div className="text-sm font-medium">Paso #{i + 1}</div>
										<div className="flex flex-wrap items-center gap-2">
											{i > 0 && (
												<button
													type="button"
													onClick={() => move(i, i - 1)}
													className="rounded-md border px-2 py-1 text-xs"
													title="Subir"
												>
													↑
												</button>
											)}
											{i < fields.length - 1 && (
												<button
													type="button"
													onClick={() => move(i, i + 1)}
													className="rounded-md border px-2 py-1 text-xs"
													title="Bajar"
												>
													↓
												</button>
											)}
											<button
												type="button"
												onClick={() => remove(i)}
												className="rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-xs text-rose-700"
												title="Eliminar"
											>
												Eliminar
											</button>
										</div>
									</div>

									<div className="grid grid-cols-1 gap-3 sm:grid-cols-5">
										<div className="sm:col-span-1">
											<RHFInput
												name={`steps.${i}.n`}
												label="N°"
												placeholder={String(i + 1).padStart(2, "0")}
											/>
										</div>
										<div className="sm:col-span-4">
											<RHFInput
												name={`steps.${i}.t`}
												label="Título del paso"
												placeholder="Análisis / Diseño / …"
											/>
										</div>
									</div>

									<div className="mt-3">
										<label className="text-sm font-medium text-slate-700 dark:text-white/80">
											Descripción
										</label>
										<textarea
											className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none ring-indigo-500 focus:ring-2 dark:bg-gray-900"
											rows={4}
											placeholder="Detalle breve del paso…"
											{...register(`steps.${i}.d` as const)}
										/>
										<p className="mt-1 text-xs text-slate-500">
											Mantén el texto conciso; se corta en la preview.
										</p>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>

				<div className="space-y-4">
					<div className="rounded-lg border border-gray-200 dark:border-white/10 overflow-hidden">
						<div className="bg-gray-50 dark:bg-white/5 px-3 py-2 text-sm font-medium">
							Vista previa
						</div>
						<div className="p-4">
							<Preview />
						</div>
					</div>

					<div className="flex flex-col gap-2 sm:flex-row sm:items-center">
						<button
							type="submit"
							disabled={saving}
							className="inline-flex w-full sm:w-auto items-center justify-center rounded-md px-5 py-2.5 text-sm bg-black text-white hover:opacity-90 disabled:opacity-60"
						>
							{saving ? "Guardando…" : "Guardar cambios"}
						</button>

						{error && <span className="text-sm text-red-600">{error}</span>}
						{!!msg && <span className="text-sm text-green-600">{msg}</span>}
					</div>
				</div>
			</form>
		</FormProvider>
	);
}

function Preview() {
	const { watch } = useFormContext<FormValues>();
	const title = watch("title");
	const steps = watch("steps") || [];

	return (
		<section className="py-0">
			<div className="mx-auto max-w-[1200px]">
				<h2 className="text-2xl md:text-3xl font-semibold">
					{title || "Proceso"}
				</h2>

				<ol className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
					{steps.map((p: ProcesoPaso, idx: number) => (
						<li
							key={`${p.n}-${idx}`}
							className="rounded-lg border border-black/10 dark:border-white/10 p-6 h-full"
						>
							<div className="text-xs opacity-70">
								{p.n || String(idx + 1).padStart(2, "0")}
							</div>
							<div className="mt-1 font-medium text-base md:text-[17px] line-clamp-1">
								{p.t || "Título"}
							</div>
							<div className="mt-0.5 text-sm text-black/70 dark:text-white/70 line-clamp-3">
								{p.d || "Descripción breve"}
							</div>
						</li>
					))}
				</ol>
			</div>
		</section>
	);
}
