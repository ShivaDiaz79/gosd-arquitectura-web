"use client";

import { FormProvider, useForm } from "react-hook-form";
import RHFInput from "@/components/form/RHFInput";
import Button from "@/components/ui/button/Button";
import type { PlanRow } from "@/lib/types/plan.type";
import { PlansService } from "@/services/PlansService";
import { useState } from "react";

type FormValues = { name: string; price: number; note?: string };

export default function PlanForm({
	plan,
	onSaved,
}: {
	plan?: PlanRow | null;
	onSaved?: (id?: string) => void;
}) {
	const methods = useForm<FormValues>({
		defaultValues: plan ?? { name: "", price: 0, note: "" },
	});
	const [saving, setSaving] = useState(false);
	const [msg, setMsg] = useState<string | null>(null);
	const [err, setErr] = useState<string | null>(null);

	const onSubmit = methods.handleSubmit(async (v) => {
		setSaving(true);
		setErr(null);
		setMsg(null);
		try {
			if (plan) {
				await PlansService.update(plan.id, {
					name: v.name,
					price: v.price,
					note: v.note,
				});
				setMsg("Plan actualizado.");
				onSaved?.(plan.id);
			} else {
				const res = await PlansService.create({
					name: v.name,
					price: v.price,
					note: v.note,
				});
				setMsg("Plan creado.");
				methods.reset({ name: "", price: 0, note: "" });
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
					<RHFInput
						name="name"
						label="Nombre del plan"
						placeholder="Ej. Estándar"
					/>
					<RHFInput
						name="price"
						label="Precio ($/m²)"
						type="number"
						step="0.01"
						inputMode="decimal"
					/>
				</div>
				<div className="space-y-1.5">
					<label className="text-sm font-medium text-slate-700">
						Notas (opcional)
					</label>
					<textarea
						className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none ring-indigo-500 focus:ring-2"
						rows={4}
						placeholder="Detalles del plan…"
						{...methods.register("note")}
					/>
				</div>

				<div className="flex items-center gap-3">
					<Button type="submit" disabled={saving}>
						{saving ? "Guardando…" : plan ? "Guardar cambios" : "Crear plan"}
					</Button>
					{err && <span className="text-sm text-red-600">{err}</span>}
					{msg && <span className="text-sm text-green-600">{msg}</span>}
				</div>
			</form>
		</FormProvider>
	);
}
