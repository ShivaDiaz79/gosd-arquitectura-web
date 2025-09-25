"use client";

import { useFieldArray, useForm, FormProvider } from "react-hook-form";
import Button from "@/components/ui/button/Button";
import RHFInput from "@/components/form/RHFInput";
import type { FeeRow, FeeRange } from "@/lib/types/fee.type";
import { FeesService } from "@/services/FeesService";
import { useState } from "react";

type FormValues = {
	name: string;
	note?: string;
	ranges: FeeRange[];
};

export default function FeeForm({
	fee,
	onSaved,
}: {
	fee?: FeeRow | null;
	onSaved?: (id?: string) => void;
}) {
	const methods = useForm<FormValues>({
		defaultValues: fee ?? {
			name: "",
			note: "",
			ranges: [{ from: 0, to: 100, price: 0 }],
		},
	});

	const {
		control,
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = methods;
	const { fields, append, remove } = useFieldArray({ control, name: "ranges" });

	const [saving, setSaving] = useState(false);
	const [msg, setMsg] = useState<string | null>(null);
	const [err, setErr] = useState<string | null>(null);

	const onSubmit = handleSubmit(async (vals) => {
		setSaving(true);
		setErr(null);
		setMsg(null);
		try {
			const ordered = [...vals.ranges]
				.map((r) => ({
					from: Number(r.from),
					to:
						r.to === null || r.to === undefined || String(r.to) === ""
							? null
							: Number(r.to),
					price: Number(r.price),
				}))
				.sort((a, b) => a.from - b.from);

			if (fee) {
				await FeesService.update(fee.id, {
					name: vals.name,
					note: vals.note,
					ranges: ordered,
				});
				setMsg("Categoría actualizada.");
				onSaved?.(fee.id);
			} else {
				const res = await FeesService.create({
					name: vals.name,
					note: vals.note,
					ranges: ordered,
				});
				setMsg("Categoría creada.");
				reset({ name: "", note: "", ranges: [{ from: 0, to: 100, price: 0 }] });
				onSaved?.(res.id);
			}
		} catch (e: any) {
			setErr(e?.message || "No se pudo guardar.");
		} finally {
			setSaving(false);
		}
	});

	return (
		<FormProvider {...methods}>
			<form onSubmit={onSubmit} className="space-y-6">
				<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
					<div className="space-y-4">
						<RHFInput
							name="name"
							label="Nombre de la categoría"
							placeholder="Ej. Vivienda"
						/>
						<div className="space-y-1.5">
							<label className="text-sm font-medium text-slate-700">
								Notas (opcional)
							</label>
							<textarea
								rows={5}
								className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none ring-indigo-500 focus:ring-2 dark:bg-gray-900"
								placeholder="Descripción breve…"
								{...register("note")}
							/>
						</div>
					</div>

					<div className="space-y-3">
						<div className="flex items-center justify-between">
							<h4 className="text-sm font-semibold">Rangos</h4>
							<Button
								type="button"
								onClick={() => append({ from: 0, to: 0, price: 0 })}
								variant="outline"
							>
								+ Agregar rango
							</Button>
						</div>

						<div className="rounded-lg border border-slate-200">
							<div className="grid grid-cols-12 gap-2 border-b bg-slate-50 px-3 py-2 text-xs font-medium">
								<div className="col-span-3">De (m²)</div>
								<div className="col-span-3">A (m²)</div>
								<div className="col-span-4">$us/m²</div>
								<div className="col-span-2">—</div>
							</div>

							<div className="divide-y">
								{fields.map((f, idx) => (
									<div key={f.id} className="grid grid-cols-12 gap-2 px-3 py-2">
										<input
											type="number"
											step="1"
											className="col-span-3 rounded border px-2 py-1 text-sm"
											{...register(`ranges.${idx}.from`, {
												valueAsNumber: true,
											})}
										/>
										<input
											type="number"
											step="1"
											placeholder="(a más = deja vacío)"
											className="col-span-3 rounded border px-2 py-1 text-sm"
											{...register(`ranges.${idx}.to`, {
												setValueAs: (v) => (v === "" ? null : Number(v)),
											})}
										/>
										<input
											type="number"
											step="0.01"
											className="col-span-4 rounded border px-2 py-1 text-sm"
											{...register(`ranges.${idx}.price`, {
												valueAsNumber: true,
											})}
										/>
										<div className="col-span-2 flex items-center justify-end">
											<button
												type="button"
												onClick={() => remove(idx)}
												className="rounded border border-rose-200 bg-rose-50 px-2 py-1 text-xs text-rose-700"
											>
												Eliminar
											</button>
										</div>
									</div>
								))}
							</div>
						</div>

						{errors.ranges && (
							<p className="text-xs text-error-500">Revisa los rangos.</p>
						)}
					</div>
				</div>

				<div className="flex items-center gap-3">
					<Button type="submit" disabled={saving}>
						{saving
							? "Guardando…"
							: fee
							? "Guardar cambios"
							: "Crear categoría"}
					</Button>
					{err && <span className="text-sm text-red-600">{err}</span>}
					{msg && <span className="text-sm text-green-600">{msg}</span>}
				</div>
			</form>
		</FormProvider>
	);
}
