// src/components/labors/LaborForm.tsx
"use client";

import { FormProvider, useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import Button from "@/components/ui/button/Button";
import RHFInput from "@/components/form/RHFInput";
import { LaborService } from "@/services/LaborService";
import type { LaborRow } from "@/lib/types/labor.type";

type FormValues = {
	name: string;
	category?: string;
	unit: "hora" | "día";
	hoursPerDay: number | string;
	rateBs: number | string;
	rateUsd: number | string;
	tc: number | string; // tipo de cambio opcional
	linkHourDay?: boolean; // si está en true, convierte hora<->día con hoursPerDay
};

export default function LaborForm({
	labor,
	onSaved,
}: {
	labor?: LaborRow | null;
	onSaved?: (id: string) => void;
}) {
	const methods = useForm<FormValues>({
		defaultValues: {
			name: labor?.name ?? "",
			category: labor?.category ?? "",
			unit: (labor?.unit as any) ?? "hora",
			hoursPerDay: labor?.hoursPerDay ?? 8,
			rateBs: labor?.rateBs ?? "",
			rateUsd: labor?.rateUsd ?? "",
			tc: 6.96,
			linkHourDay: true,
		},
	});

	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [ok, setOk] = useState<string | null>(null);

	useEffect(() => {
		methods.reset({
			name: labor?.name ?? "",
			category: labor?.category ?? "",
			unit: (labor?.unit as any) ?? "hora",
			hoursPerDay: labor?.hoursPerDay ?? 8,
			rateBs: labor?.rateBs ?? "",
			rateUsd: labor?.rateUsd ?? "",
			tc: 6.96,
			linkHourDay: true,
		});
		setError(null);
		setOk(null);
	}, [labor?.id, methods]);

	function autoCalc(v: FormValues): FormValues {
		const tc = Number(v.tc) || 0;
		const bs = Number(v.rateBs);
		const usd = Number(v.rateUsd);
		const hpd = Number(v.hoursPerDay) || 8;

		// Calcular USD si falta y hay Bs + TC
		if (!isNaN(bs) && bs > 0 && (isNaN(usd) || usd === 0) && tc > 0) {
			v.rateUsd = +(bs / tc).toFixed(2);
		} else if (!isNaN(usd) && usd > 0 && (isNaN(bs) || bs === 0) && tc > 0) {
			v.rateBs = +(usd * tc).toFixed(2);
		}

		// Opcional: convertir hora<->día manteniendo relación
		if (v.linkHourDay) {
			if (v.unit === "día") {
				// si la unidad es día, la tarifa ingresada se asume por día
				// podríamos calcular un "equivalente por hora" interno si lo quisieras guardar;
				// aquí guardamos lo que el usuario ingresa sin modificar.
				// (La derivación visual se puede mostrar en la UI si quieres)
			} else {
				// unidad hora (similar nota que arriba)
			}
		}
		return v;
	}

	const onSubmit = methods.handleSubmit(async (vals) => {
		setSaving(true);
		setError(null);
		setOk(null);
		const v = autoCalc({ ...vals });

		try {
			if (labor) {
				await LaborService.update(labor.id, {
					name: v.name,
					category: v.category,
					unit: v.unit,
					hoursPerDay: Number(v.hoursPerDay) || 8,
					rateBs: Number(v.rateBs) || 0,
					rateUsd: Number(v.rateUsd) || 0,
				});
				setOk("Registro actualizado.");
				onSaved?.(labor.id);
			} else {
				const res = await LaborService.create({
					name: v.name,
					category: v.category,
					unit: v.unit,
					hoursPerDay: Number(v.hoursPerDay) || 8,
					rateBs: Number(v.rateBs) || 0,
					rateUsd: Number(v.rateUsd) || 0,
				});
				setOk("Registro creado.");
				methods.reset({
					name: "",
					category: "",
					unit: "hora",
					hoursPerDay: 8,
					rateBs: "",
					rateUsd: "",
					tc: 6.96,
					linkHourDay: true,
				});
				onSaved?.(res.id);
			}
		} catch (e: any) {
			setError(e?.message || "No se pudo guardar.");
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
							label="Nombre / Cargo"
							placeholder="Albañil, Oficial, Operario…"
							rules={{ required: "Requerido" }}
						/>
						<RHFInput
							name="category"
							label="Categoría (opcional)"
							placeholder="Oficial / Ayudante…"
						/>
						<div className="space-y-1.5">
							<label className="text-sm font-medium">Unidad</label>
							<select
								{...methods.register("unit")}
								className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none ring-indigo-500 focus:ring-2 dark:bg-gray-900"
							>
								<option value="hora">Hora</option>
								<option value="día">Día</option>
							</select>
						</div>
						<RHFInput
							type="number"
							step="0.1"
							name="hoursPerDay"
							label="Horas por día (referencia)"
							placeholder="8"
						/>
					</div>

					<div className="space-y-4">
						<RHFInput
							type="number"
							step="0.01"
							name="rateBs"
							label="Tarifa en Bs (por unidad)"
							placeholder="0.00"
						/>
						<RHFInput
							type="number"
							step="0.01"
							name="rateUsd"
							label="Tarifa en USD (por unidad)"
							placeholder="0.00"
						/>
						<RHFInput
							type="number"
							step="0.0001"
							name="tc"
							label="Tipo de cambio (opcional)"
							placeholder="6.96"
						/>
						<div className="flex items-center gap-2">
							<input
								id="link"
								type="checkbox"
								{...methods.register("linkHourDay")}
							/>
							<label htmlFor="link" className="text-sm">
								Relacionar hora ↔ día con “Horas por día”
							</label>
						</div>
					</div>
				</div>

				<div className="flex items-center gap-3">
					<Button type="submit" disabled={saving}>
						{saving && (
							<svg
								className="mr-2 h-4 w-4 animate-spin"
								viewBox="0 0 24 24"
								fill="none"
							>
								<circle
									className="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									strokeWidth="4"
								/>
								<path
									className="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
								/>
							</svg>
						)}
						{labor ? "Guardar cambios" : "Crear registro"}
					</Button>
					{error && <span className="text-sm text-red-600">{error}</span>}
					{ok && <span className="text-sm text-green-600">{ok}</span>}
				</div>
			</form>
		</FormProvider>
	);
}
