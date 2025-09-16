"use client";

import { useEffect, useMemo, useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import Button from "@/components/ui/button/Button";
import RHFInput from "@/components/form/RHFInput";
import RHFSelect from "@/components/form/RHFSelect";
import { CotizadorService } from "@/services/CotizadorService";
import type { CotizadorConfig } from "@/services/CotizadorService";

type FGrupo = { g_label: string; g_value: string };
type FSub = { parent_g: string; s_label: string; s_value: string };
type FTarif = { tarifas: Record<string, number | string> };
type FMatriz = { l1: string; l2: string; l3: string; subs: string[] };

const slug = (s: string) =>
	s
		.toLowerCase()
		.normalize("NFD")
		.replace(/\p{Diacritic}/gu, "")
		.replace(/\s+/g, "_")
		.replace(/[^a-z0-9_]/g, "");

export default function EntregablesDisenoAdmin() {
	const [cfg, setCfg] = useState<CotizadorConfig | null>(null);
	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		(async () => {
			setLoading(true);
			try {
				setCfg(await CotizadorService.getConfig());
			} catch (e: any) {
				setError(e?.message || "No se pudo cargar la configuración.");
			} finally {
				setLoading(false);
			}
		})();
	}, []);

	const G = cfg?.ENTREGABLES_DISENO_L1 || [];
	const S = cfg?.ENTREGABLES_DISENO_L2 || {};
	const TAR = cfg?.TARIFAS_ENTREGABLES_M2 || {};
	const MAT = cfg?.MATRIZ_ENTREGABLES_POR_CATEGORIA || {};
	const L1 = cfg?.CATEGORIA_L1 || [];
	const L2 = cfg?.CATEGORIA_L2 || {};
	const L3 = cfg?.CATEGORIA_L3 || {};

	const fG = useForm<FGrupo>({
		defaultValues: { g_label: "", g_value: "" },
		mode: "onTouched",
	});
	const addGrupo = async (d: FGrupo) => {
		setSaving(true);
		try {
			const label = d.g_label.trim();
			const value = (d.g_value || slug(label)).trim();
			if (label.length < 2 || !/^[a-z0-9_]+$/.test(value))
				throw new Error("Datos inválidos");
			const next = await CotizadorService.addEntregableDisenoGrupo({
				label,
				value,
			});
			setCfg((p) => (p ? { ...p, ENTREGABLES_DISENO_L1: next } : p));
			fG.reset({ g_label: "", g_value: "" });
		} catch (e: any) {
			setError(e?.message || "No se pudo guardar el grupo.");
		} finally {
			setSaving(false);
		}
	};
	const rmGrupo = async (v: string) => {
		if (!confirm("Eliminar grupo y sus sub-entregables?")) return;
		setSaving(true);
		try {
			await CotizadorService.removeEntregableDisenoGrupo(v);
			setCfg(await CotizadorService.getConfig());
		} catch (e: any) {
			setError(e?.message || "No se pudo eliminar el grupo.");
		} finally {
			setSaving(false);
		}
	};

	const fS = useForm<FSub>({
		defaultValues: { parent_g: "", s_label: "", s_value: "" },
		mode: "onTouched",
	});
	const addSub = async (d: FSub) => {
		setSaving(true);
		try {
			const parent = d.parent_g;
			const label = d.s_label.trim();
			const value = (d.s_value || slug(label)).trim();
			if (!parent) throw new Error("Seleccione grupo.");
			if (label.length < 2 || !/^[a-z0-9_]+$/.test(value))
				throw new Error("Datos inválidos");
			const next = await CotizadorService.addEntregableDisenoSub(parent, {
				label,
				value,
			});
			setCfg((p) => (p ? { ...p, ENTREGABLES_DISENO_L2: next } : p));
			fS.reset({ parent_g: parent, s_label: "", s_value: "" });
		} catch (e: any) {
			setError(e?.message || "No se pudo guardar sub-entregable.");
		} finally {
			setSaving(false);
		}
	};
	const rmSub = async (parent: string, v: string) => {
		if (!confirm("¿Eliminar sub-entregable?")) return;
		setSaving(true);
		try {
			await CotizadorService.removeEntregableDisenoSub(parent, v);
			setCfg(await CotizadorService.getConfig());
		} catch (e: any) {
			setError(e?.message || "No se pudo eliminar sub-entregable.");
		} finally {
			setSaving(false);
		}
	};

	const fT = useForm<FTarif>({
		defaultValues: { tarifas: {} },
		mode: "onTouched",
	});
	useEffect(() => {
		if (!cfg) return;
		const initial: Record<string, number | string> = {};
		for (const g of G)
			for (const s of S[g.value] || []) initial[s.value] = TAR[s.value] ?? "";
		fT.reset({ tarifas: initial });
	}, [cfg]);

	const saveTarifas = async (d: FTarif) => {
		setSaving(true);
		try {
			const clean: Record<string, number> = {};
			for (const [k, v] of Object.entries(d.tarifas || {})) {
				const n = typeof v === "string" ? parseFloat(v) : v;
				if (Number.isFinite(n)) clean[k] = n as number;
			}
			const next = await CotizadorService.bulkSetTarifasEntregablesM2(clean);
			setCfg((p) => (p ? { ...p, TARIFAS_ENTREGABLES_M2: next } : p));
		} catch (e: any) {
			setError(e?.message || "No se pudieron guardar tarifas.");
		} finally {
			setSaving(false);
		}
	};

	const fM = useForm<FMatriz>({
		defaultValues: { l1: "", l2: "", l3: "", subs: [] },
		mode: "onTouched",
	});
	const l1Sel = fM.watch("l1");
	const l2Sel = fM.watch("l2");
	useEffect(() => {
		fM.setValue("l2", "");
		fM.setValue("l3", "");
	}, [l1Sel]);
	useEffect(() => {
		fM.setValue("l3", "");
	}, [l2Sel]);
	const l2Opts = useMemo(() => (l1Sel ? L2[l1Sel] || [] : []), [L2, l1Sel]);
	const l3Opts = useMemo(() => (l2Sel ? L3[l2Sel] || [] : []), [L3, l2Sel]);
	const catKey = (fM.watch("l3") ||
		fM.watch("l2") ||
		fM.watch("l1") ||
		"") as string;

	useEffect(() => {
		fM.setValue("subs", MAT[catKey] || []);
	}, [catKey]);

	const subsPorGrupo = useMemo(() => {
		const out: Record<string, { value: string; label: string }[]> = {};
		for (const g of G) out[g.value] = [...(S[g.value] || [])];
		return out;
	}, [G, S]);

	const saveMatriz = async (d: FMatriz) => {
		setSaving(true);
		try {
			const key = (d.l3 || d.l2 || d.l1 || "").trim();
			if (!key) {
				alert("Seleccione al menos L1");
				setSaving(false);
				return;
			}
			const next = await CotizadorService.setMatrizEntregablesCategoria(
				key,
				d.subs || []
			);
			setCfg((p) => (p ? { ...p, MATRIZ_ENTREGABLES_POR_CATEGORIA: next } : p));
		} catch (e: any) {
			setError(e?.message || "No se pudo guardar matriz.");
		} finally {
			setSaving(false);
		}
	};

	return (
		<div className="space-y-10">
			{loading && <div className="text-sm text-gray-500">Cargando…</div>}
			{error && <div className="text-sm text-red-600">{error}</div>}

			<section className="space-y-4 rounded-lg border p-4">
				<h2 className="text-lg font-semibold">Grupos (L1)</h2>
				<FormProvider {...fG}>
					<form
						onSubmit={fG.handleSubmit(addGrupo)}
						className="grid sm:grid-cols-2 gap-4"
					>
						<RHFInput
							name="g_label"
							label="Nombre del grupo"
							placeholder="Ej.: INSTALACIONES ELÉCTRICAS"
							required
							minLength={2}
						/>
						<RHFInput
							name="g_value"
							label="Slug (opcional)"
							placeholder="Ej.: instalaciones_electricas"
							pattern="^[a-z0-9_]+$"
						/>
						<div className="sm:col-span-2 flex gap-2">
							<Button type="submit" disabled={saving}>
								{saving ? "Guardando…" : "Agregar grupo"}
							</Button>
							<Button
								type="button"
								variant="outline"
								onClick={() => fG.reset({ g_label: "", g_value: "" })}
								disabled={saving}
							>
								Limpiar
							</Button>
						</div>
					</form>
				</FormProvider>

				<div className="rounded-lg border">
					<div className="grid grid-cols-12 px-4 py-2 text-xs font-medium text-gray-500">
						<div className="col-span-6">Grupo</div>
						<div className="col-span-4">Slug</div>
						<div className="col-span-2 text-right">Acciones</div>
					</div>
					<div className="divide-y">
						{G.length === 0 && (
							<div className="px-4 py-4 text-sm text-gray-500">Sin grupos.</div>
						)}
						{G.map((g) => (
							<div
								key={g.value}
								className="grid grid-cols-12 px-4 py-3 items-center"
							>
								<div className="col-span-6 text-sm">{g.label}</div>
								<div className="col-span-4">
									<code className="text-xs bg-gray-50 px-2 py-1 rounded">
										{g.value}
									</code>
								</div>
								<div className="col-span-2 flex justify-end">
									<Button
										size="sm"
										variant="outline"
										onClick={() => rmGrupo(g.value)}
										disabled={saving}
									>
										Eliminar
									</Button>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			<section className="space-y-4 rounded-lg border p-4">
				<h2 className="text-lg font-semibold">Sub-entregables (L2)</h2>
				<FormProvider {...fS}>
					<form
						onSubmit={fS.handleSubmit(addSub)}
						className="grid sm:grid-cols-3 gap-4"
					>
						<RHFSelect
							name="parent_g"
							label="Grupo"
							placeholder="Seleccione…"
							options={G}
						/>
						<RHFInput
							name="s_label"
							label="Nombre sub"
							placeholder="Ej.: BAJA TENSIÓN"
							required
							minLength={2}
						/>
						<RHFInput
							name="s_value"
							label="Slug (opcional)"
							placeholder="Ej.: baja_tension"
							pattern="^[a-z0-9_]+$"
						/>
						<div className="sm:col-span-3">
							<Button type="submit" disabled={saving}>
								{saving ? "Guardando…" : "Agregar sub-entregable"}
							</Button>
						</div>
					</form>
				</FormProvider>

				<div className="rounded-lg border">
					<div className="grid grid-cols-12 px-4 py-2 text-xs font-medium text-gray-500">
						<div className="col-span-3">Grupo</div>
						<div className="col-span-5">Sub-entregable</div>
						<div className="col-span-2">Slug</div>
						<div className="col-span-2 text-right">Acciones</div>
					</div>
					<div className="divide-y">
						{G.length === 0 && (
							<div className="px-4 py-4 text-sm text-gray-500">
								Agregue un grupo primero.
							</div>
						)}
						{G.map((g) =>
							(S[g.value] || []).map((s) => (
								<div
									key={`${g.value}__${s.value}`}
									className="grid grid-cols-12 px-4 py-3 items-center"
								>
									<div className="col-span-3 text-sm">{g.label}</div>
									<div className="col-span-5 text-sm">{s.label}</div>
									<div className="col-span-2">
										<code className="text-xs bg-gray-50 px-2 py-1 rounded">
											{s.value}
										</code>
									</div>
									<div className="col-span-2 flex justify-end">
										<Button
											size="sm"
											variant="outline"
											onClick={() => rmSub(g.value, s.value)}
											disabled={saving}
										>
											Eliminar
										</Button>
									</div>
								</div>
							))
						)}
					</div>
				</div>
			</section>

			<section className="space-y-4 rounded-lg border p-4">
				<h2 className="text-lg font-semibold">Tarifas por m² (diseño)</h2>
				<FormProvider {...fT}>
					<form
						onSubmit={fT.handleSubmit(saveTarifas)}
						className="grid md:grid-cols-2 gap-4"
					>
						{G.flatMap((g) =>
							(S[g.value] || []).map((s) => (
								<Controller
									key={s.value}
									name={`tarifas.${s.value}` as const}
									render={({ field }) => (
										<RHFInput
											name={field.name}
											label={`${g.label} — ${s.label} (Bs/m²)`}
											type="number"
											step="0.01"
											inputMode="decimal"
											placeholder="0.00"
											onChange={(e) => field.onChange(e.target.value)}
										/>
									)}
								/>
							))
						)}
						<div className="md:col-span-2">
							<Button type="submit" disabled={saving}>
								{saving ? "Guardando…" : "Guardar tarifas"}
							</Button>
						</div>
					</form>
				</FormProvider>
			</section>

			<section className="space-y-4 rounded-lg border p-4">
				<h2 className="text-lg font-semibold">
					Matriz de entregables por categoría
				</h2>
				<FormProvider {...fM}>
					<form onSubmit={fM.handleSubmit(saveMatriz)} className="space-y-4">
						<div className="grid sm:grid-cols-3 gap-4">
							<RHFSelect
								name="l1"
								label="Categoría L1"
								placeholder="Seleccione…"
								options={L1}
							/>
							<RHFSelect
								name="l2"
								label="Categoría L2"
								placeholder="Opcional"
								options={useMemo(
									() => (fM.watch("l1") ? L2[fM.watch("l1")] || [] : []),
									[L2, fM.watch("l1")]
								)}
								disabled={!fM.watch("l1")}
							/>
							<RHFSelect
								name="l3"
								label="Categoría L3"
								placeholder="Opcional"
								options={useMemo(
									() => (fM.watch("l2") ? L3[fM.watch("l2")] || [] : []),
									[L3, fM.watch("l2")]
								)}
								disabled={!fM.watch("l2")}
							/>
						</div>

						<Controller
							name="subs"
							render={({ field }) => {
								const selected: string[] = field.value || [];
								const toggle = (v: string) =>
									field.onChange(
										selected.includes(v)
											? selected.filter((x) => x !== v)
											: [...selected, v]
									);
								return (
									<div className="space-y-4">
										{G.map((g) => (
											<div key={g.value}>
												<div className="text-sm font-medium mb-2">
													{g.label}
												</div>
												<div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
													{(S[g.value] || []).map((s) => (
														<label
															key={s.value}
															className="flex items-center gap-2 text-sm"
														>
															<input
																type="checkbox"
																className="h-4 w-4 rounded border-gray-300"
																checked={selected.includes(s.value)}
																onChange={() => toggle(s.value)}
															/>
															<span>{s.label}</span>
														</label>
													))}
												</div>
											</div>
										))}
									</div>
								);
							}}
						/>

						<div className="flex gap-2">
							<Button
								type="submit"
								disabled={
									saving ||
									!(fM.watch("l1") || fM.watch("l2") || fM.watch("l3"))
								}
							>
								{saving ? "Guardando…" : "Guardar matriz"}
							</Button>
						</div>
					</form>
				</FormProvider>

				<div className="rounded-lg border mt-4">
					<div className="px-4 py-2 text-xs font-medium text-gray-500">
						Definiciones actuales
					</div>
					<div className="divide-y">
						{Object.keys(MAT).length === 0 && (
							<div className="px-4 py-4 text-sm text-gray-500">
								Sin reglas aún.
							</div>
						)}
						{Object.entries(MAT).map(([cat, arr]) => (
							<div key={cat} className="px-4 py-3 text-sm">
								<div className="font-medium">{cat}</div>
								<div className="mt-1 text-gray-700">
									{(arr || [])
										.map((v) => {
											const g = G.find((gg) =>
												(S[gg.value] || []).some((s) => s.value === v)
											);
											const s = g
												? (S[g.value] || []).find((x) => x.value === v)
												: null;
											return s ? `${g!.label} — ${s.label}` : v;
										})
										.join(", ") || "—"}
								</div>
							</div>
						))}
					</div>
				</div>
			</section>
		</div>
	);
}
