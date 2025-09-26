"use client";

import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { useEffect, useMemo, useState } from "react";
import RHFInput from "@/components/form/RHFInput";
import Button from "@/components/ui/button/Button";
import type { AreaMixRow } from "@/lib/types/area-mix.type";
import { AreaMixService } from "@/services/AreaMixService";
import { FeesService } from "@/services/FeesService";
import type { FeeRow } from "@/lib/types/fee.type";

type KV = { key: string; pct: number | string };
type FormValues = {
	name: string;
	categoryId?: string;
	notes?: string;
	feeId?: string;
	feeName?: string;
	items: KV[];
};

function toShares(items: KV[]) {
	const shares: Record<string, number> = {};
	for (const it of items) {
		if (!it.key) continue;
		const p = Number(it.pct);
		shares[it.key.trim()] = isFinite(p) ? (p || 0) / 100 : 0;
	}
	return shares;
}

export default function AreaMixForm({
	mix,
	onSaved,
}: {
	mix?: AreaMixRow | null;
	onSaved?: (id: string) => void;
}) {
	const methods = useForm<FormValues>({
		defaultValues: {
			name: mix?.name ?? "",
			categoryId: mix?.categoryId ?? "",
			notes: mix?.notes ?? "",
			feeId: mix?.feeId ?? "",
			feeName: mix?.feeName ?? "",
			items: mix
				? Object.entries(mix.shares).map(([k, v]) => ({
						key: k,
						pct: (v * 100).toFixed(2),
				  }))
				: [
						{ key: "baño", pct: 7 },
						{ key: "sala", pct: 25 },
						{ key: "cuartos", pct: 56 },
						{ key: "gradas", pct: 3 },
						{ key: "cocina", pct: 9 },
				  ],
		},
	});

	const { control, watch, reset } = methods;
	const { fields, append, remove } = useFieldArray({ control, name: "items" });

	const sumPct = useMemo(
		() =>
			(watch("items") || []).reduce(
				(acc, it) => acc + (Number(it.pct) || 0),
				0
			),
		[watch]
	);

	const [fees, setFees] = useState<FeeRow[]>([]);
	useEffect(() => {
		FeesService.listAll()
			.then(setFees)
			.catch(() => setFees([]));
	}, []);

	useEffect(() => {
		if (!mix) return;
		reset({
			name: mix.name,
			categoryId: mix.categoryId || "",
			notes: mix.notes || "",
			feeId: mix.feeId || "",
			feeName: mix.feeName || "",
			items: Object.entries(mix.shares).map(([k, v]) => ({
				key: k,
				pct: (v * 100).toFixed(2),
			})),
		});
	}, [mix, reset]);

	const [saving, setSaving] = useState(false);
	const [err, setErr] = useState<string | null>(null);
	const [ok, setOk] = useState<string | null>(null);

	const onSubmit = methods.handleSubmit(async (v) => {
		setSaving(true);
		setErr(null);
		setOk(null);
		try {
			const shares = toShares(v.items);
			const sum = Object.values(shares).reduce((a, b) => a + b, 0);
			if (Math.abs(sum - 1) > 0.001)
				throw new Error("Los porcentajes deben sumar 100%.");

			if (mix) {
				await AreaMixService.update(mix.id, {
					name: v.name,
					categoryId: v.categoryId,
					notes: v.notes,
					shares,
					feeId: v.feeId || null,
					feeName: v.feeName || null,
				});
				setOk("Perfil actualizado.");
				onSaved?.(mix.id);
			} else {
				const res = await AreaMixService.create({
					name: v.name,
					categoryId: v.categoryId,
					notes: v.notes,
					shares,
					feeId: v.feeId || null,
					feeName: v.feeName || null,
				});
				setOk("Perfil creado.");
				reset({
					name: "",
					categoryId: "",
					notes: "",
					feeId: "",
					feeName: "",
					items: [],
				});
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
							label="Nombre del perfil"
							placeholder="Vivienda estándar"
							rules={{ required: "Requerido" }}
						/>
						<RHFInput
							name="categoryId"
							label="Categoría (opcional)"
							placeholder="vivienda / comercio / oficina…"
						/>
						<div className="space-y-1.5">
							<label className="text-sm font-medium">
								Categoría de tarifas (fees)
							</label>
							<select
								{...methods.register("feeId")}
								className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none ring-indigo-500 focus:ring-2 dark:bg-gray-900"
								onChange={(e) => {
									const f = fees.find((x) => x.id === e.target.value);
									methods.setValue("feeId", e.target.value);
									methods.setValue("feeName", f?.name || "");
								}}
								value={methods.watch("feeId")}
							>
								<option value="">— Sin vínculo —</option>
								{fees.map((f) => (
									<option key={f.id} value={f.id}>
										{f.name}
									</option>
								))}
							</select>
						</div>
						<div className="space-y-1.5">
							<label className="text-sm font-medium">Notas (opcional)</label>
							<textarea
								{...methods.register("notes")}
								rows={4}
								className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none ring-indigo-500 focus:ring-2 dark:bg-gray-900"
							/>
						</div>
					</div>

					<div className="space-y-3">
						<div className="flex items-center justify-between">
							<div
								className={`text-sm ${
									Math.abs(sumPct - 100) < 0.01
										? "text-emerald-600"
										: "text-rose-600"
								}`}
							>
								Suma: <b>{sumPct.toFixed(2)}%</b>
							</div>
							<button
								type="button"
								onClick={() => append({ key: "", pct: 0 })}
								className="rounded-md border px-3 py-1.5 text-xs"
							>
								+ Agregar
							</button>
						</div>

						<div className="rounded-lg border">
							<div className="bg-gray-50 px-3 py-2 text-sm font-medium">
								Ambientes y porcentajes
							</div>
							<div className="divide-y">
								{fields.map((f, idx) => (
									<div key={f.id} className="grid grid-cols-12 gap-2 p-3">
										<input
											placeholder="Ambiente (ej. baño)"
											{...methods.register(`items.${idx}.key` as const, {
												required: true,
											})}
											className="col-span-6 rounded-md border border-slate-200 px-3 py-2 text-sm outline-none ring-indigo-500 focus:ring-2 dark:bg-gray-900"
										/>
										<div className="col-span-4 flex items-center gap-2">
											<input
												type="number"
												step="0.01"
												min="0"
												max="100"
												placeholder="0.00"
												{...methods.register(`items.${idx}.pct` as const)}
												className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none ring-indigo-500 focus:ring-2 dark:bg-gray-900"
											/>
											<span className="text-sm">%</span>
										</div>
										<div className="col-span-2 flex justify-end">
											<button
												type="button"
												onClick={() => remove(idx)}
												className="rounded-md border px-2 py-1 text-xs text-rose-600"
											>
												Eliminar
											</button>
										</div>
									</div>
								))}
								{fields.length === 0 && (
									<div className="p-3 text-sm text-slate-500">
										Sin ambientes. Agrega al menos uno.
									</div>
								)}
							</div>
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
						{mix ? "Guardar cambios" : "Crear perfil"}
					</Button>
					{err && <span className="text-sm text-red-600">{err}</span>}
					{ok && <span className="text-sm text-green-600">{ok}</span>}
				</div>
			</form>
		</FormProvider>
	);
}
