"use client";

import { useEffect, useMemo, useState } from "react";
import { FormProvider, useForm, Controller, useWatch } from "react-hook-form";

import RHFInput from "@/components/form/RHFInput";
import RHFMultiSelect from "@/components/form/RHFMultiSelect";
import RHFCheckbox from "@/components/form/RHFCheckbox";
import RHFRadioGroup from "@/components/form/RHFRadioGroup";
import RHFFileInput from "@/components/form/RHFFileInput";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";

import Resumen from "./Resumen";
import { keyFromCategoria } from "@/lib/helpers/cotizador";

import { CotizadorService } from "@/services/CotizadorService";
import type { CotizadorConfig } from "@/services/CotizadorService";

type FormValues = {
	servicio: "diseno" | "construccion" | "diseno_y_construccion" | "";
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

type TreeNode = { value: string; label: string; children?: TreeNode[] };

type MSOption = { value: string; text: string };

const toNumber = (v: any) =>
	typeof v === "string" ? parseFloat(v || "0") : Number(v || 0);

const slugOk = (s?: string) => !!s && /^[a-z0-9_]+$/.test(s || "");

const toMS = (
	list: Array<{ value: string; label?: string; text?: string }>
): MSOption[] =>
	list.map((o) => ({ value: o.value, text: o.text ?? o.label ?? "" }));

function flattenLeaves(
	nodes: TreeNode[],
	path: string[] = []
): { value: string; label: string; pathLabel: string }[] {
	const out: { value: string; label: string; pathLabel: string }[] = [];
	for (const n of nodes) {
		const p = [...path, n.label];
		if (!n.children || n.children.length === 0) {
			out.push({ value: n.value, label: n.label, pathLabel: p.join(" → ") });
		} else {
			out.push(...flattenLeaves(n.children as TreeNode[], p));
		}
	}
	return out.sort((a, b) => a.pathLabel.localeCompare(b.pathLabel));
}

const QuoteForm: React.FC = () => {
	const [config, setConfig] = useState<CotizadorConfig | null>(null);
	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

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
		mode: "onTouched",
	});
	const { handleSubmit, control, setValue, reset } = methods;

	useEffect(() => {
		let mounted = true;
		(async () => {
			setLoading(true);
			try {
				const cfg = await CotizadorService.getConfig();
				if (mounted) setConfig(cfg);
			} catch (e: any) {
				setError(e?.message || "No se pudo cargar configuración.");
			} finally {
				setLoading(false);
			}
		})();
		return () => {
			mounted = false;
		};
	}, []);

	const SERVICIO_OPCIONES = config?.SERVICIO_OPCIONES || [];
	const CATEGORIA_L1 = config?.CATEGORIA_L1 || [];
	const CATEGORIA_L2 = config?.CATEGORIA_L2 || {};
	const CATEGORIA_L3 = config?.CATEGORIA_L3 || {};

	const ENT_L1 = config?.ENTREGABLES_DISENO_L1 || [];
	const ENT_L2 = config?.ENTREGABLES_DISENO_L2 || {};
	const ENT_PLANOS = config?.ENTREGABLES_DISENO || [];
	const ENTREGABLES_OPTIONS: MSOption[] = useMemo(() => {
		if (ENT_L1.length) {
			const arr: { value: string; label: string }[] = [];
			for (const g of ENT_L1)
				for (const s of ENT_L2[g.value] || []) arr.push(s);
			return toMS(arr);
		}
		return toMS(ENT_PLANOS);
	}, [ENT_L1, ENT_L2, ENT_PLANOS]);

	const EXEC_TREE = (config?.EJECUTABLES_CONSTRUCCION_TREE ||
		[]) as unknown as TreeNode[];
	const EXEC_L1 = config?.EJECUTABLES_CONSTRUCCION_L1 || [];
	const EXEC_L2 = config?.EJECUTABLES_CONSTRUCCION_L2 || {};
	const EXEC_PLANOS = config?.EJECUTABLES_CONSTRUCCION || [];
	const EJECUTABLES_OPTIONS: MSOption[] = useMemo(() => {
		if (EXEC_TREE.length) {
			return flattenLeaves(EXEC_TREE).map((x) => ({
				value: x.value,
				text: x.pathLabel,
			}));
		}
		if (EXEC_L1.length) {
			const arr: MSOption[] = [];
			for (const g of EXEC_L1) {
				for (const s of EXEC_L2[g.value] || []) {
					arr.push({ value: s.value, text: `${g.label} → ${s.label}` });
				}
			}
			return arr;
		}
		return toMS(EXEC_PLANOS);
	}, [EXEC_TREE, EXEC_L1, EXEC_L2, EXEC_PLANOS]);

	const l1 = useWatch({ control, name: "categoria_l1" });
	const l2 = useWatch({ control, name: "categoria_l2" });
	const servicio = useWatch({ control, name: "servicio" });
	const todoDiseno = useWatch({ control, name: "todo_diseno" });
	const todoConstruccion = useWatch({ control, name: "todo_construccion" });
	const ejecutablesSel = (useWatch({ control, name: "ejecutables" }) ||
		[]) as string[];
	const entregablesSel = (useWatch({ control, name: "entregables" }) ||
		[]) as string[];

	const subOptionsL2 = CATEGORIA_L2[l1 || ""] || [];
	const subOptionsL3 = CATEGORIA_L3[(keyFromCategoria as any)(l1, l2)] || [];

	const showDiseno =
		servicio === "diseno" || servicio === "diseno_y_construccion";
	const showConstruccion =
		servicio === "construccion" || servicio === "diseno_y_construccion";
	const showOtrosInput =
		Array.isArray(ejecutablesSel) && ejecutablesSel.includes("otros");

	const onChangeL1 = (val: string) => {
		setValue("categoria_l1", val);
		setValue("categoria_l2", "");
		setValue("categoria_l3", "");
	};
	const onChangeL2 = (val: string) => {
		setValue("categoria_l2", val);
		setValue("categoria_l3", "");
	};

	useEffect(() => {
		if (!ejecutablesSel.includes("otros")) setValue("otros_descripcion", "");
	}, [ejecutablesSel, setValue]);

	const m2 = toNumber(useWatch({ control, name: "superficie_m2" }));
	const l3 = useWatch({ control, name: "categoria_l3" });
	const catKey =
		(l3 && slugOk(l3) && l3) ||
		(l2 && slugOk(l2) && l2) ||
		(l1 && slugOk(l1) && l1) ||
		"";

	const MATRIZ_ENT = config?.MATRIZ_ENTREGABLES_POR_CATEGORIA || {};
	const MATRIZ_EXEC = config?.MATRIZ_EJECUTABLES_POR_CATEGORIA || {};
	const entAuto = todoDiseno ? MATRIZ_ENT[catKey] || [] : entregablesSel;
	const execAuto = todoConstruccion
		? MATRIZ_EXEC[catKey] || []
		: ejecutablesSel;

	const COSTOS_M2 = config?.COSTOS_M2 || {};
	const TARIFAS_ENT = config?.TARIFAS_ENTREGABLES_M2 || {};
	const TARIFAS_EXEC = config?.TARIFAS_EJECUTABLES_M2 || {};
	const RANGOS_EXEC = config?.RANGOS_SUPERFICIE_EJECUTABLES || {};

	const costoBaseDiseno =
		(showDiseno ? COSTOS_M2[catKey]?.diseno || 0 : 0) * m2;
	const costoBaseConstruccion =
		(showConstruccion ? COSTOS_M2[catKey]?.construccion || 0 : 0) * m2;

	const costoEntregables = (entAuto || []).reduce((acc, slug) => {
		const t = TARIFAS_ENT[slug] || 0;
		return acc + t * m2;
	}, 0);

	const tarifaExecPorM2 = (slug: string, area: number) => {
		const rangos = RANGOS_EXEC[slug];
		if (Array.isArray(rangos) && rangos.length) {
			const found = rangos.find(
				(r) => area >= r.min && (r.max == null || area < r.max)
			);
			if (found) return found.tarifa_m2 || 0;
		}
		return TARIFAS_EXEC[slug] || 0;
	};

	const costoEjecutables = (execAuto || []).reduce((acc, slug) => {
		const t = tarifaExecPorM2(slug, m2);
		return acc + t * m2;
	}, 0);

	const totalDiseno = costoBaseDiseno + costoEntregables;
	const totalConstruccion = costoBaseConstruccion + costoEjecutables;
	const total = totalDiseno + totalConstruccion;

	const onSubmit = async (data: FormValues) => {
		if (!config) return;

		const payload: FormValues = {
			...data,
			entregables: entAuto,
			ejecutables: execAuto,
		};

		const breakdown = {
			categoriaKey: catKey,
			m2,
			base: {
				diseno_m2: COSTOS_M2[catKey]?.diseno || 0,
				construccion_m2: COSTOS_M2[catKey]?.construccion || 0,
				costoBaseDiseno,
				costoBaseConstruccion,
			},
			diseno: {
				entregables: entAuto.map((e) => ({
					slug: e,
					tarifa_m2: TARIFAS_ENT[e] || 0,
					subtotal: (TARIFAS_ENT[e] || 0) * m2,
				})),
				totalDiseno,
			},
			construccion: {
				ejecutables: execAuto.map((e) => ({
					slug: e,
					tarifa_m2: tarifaExecPorM2(e, m2),
					subtotal: tarifaExecPorM2(e, m2) * m2,
				})),
				totalConstruccion,
			},
			total,
		};

		try {
			setSaving(true);
			const id = await CotizadorService.saveQuote(payload);
			console.log("Cálculo de cotización:", breakdown);
			alert(`Cotización guardada: ${id}`);
		} catch (e: any) {
			alert(e?.message || "No se pudo guardar la cotización.");
		} finally {
			setSaving(false);
		}
	};

	return (
		<FormProvider {...methods}>
			<form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
				{loading && (
					<div className="text-sm text-gray-500">Cargando configuración…</div>
				)}
				{error && <div className="text-sm text-red-600">{error}</div>}

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
								Si activas esto, los entregables se tomarán de la matriz por
								categoría definida en administración.
							</p>
						</div>

						<RHFMultiSelect
							name="entregables"
							label="Selecciona entregables (si NO es todo/completo)"
							options={ENTREGABLES_OPTIONS}
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
								Si activas esto, los ejecutables se tomarán de la matriz por
								categoría (y por superficie si hay rangos configurados).
							</p>
						</div>

						<RHFMultiSelect
							name="ejecutables"
							label="Selecciona ejecutables (si NO es todo/completo)"
							options={EJECUTABLES_OPTIONS}
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

				<section className="rounded-lg border border-dashed p-4 text-sm text-gray-700 dark:text-gray-300">
					<div className="font-medium mb-2">Estimación rápida</div>
					<div>Diseño (base): Bs {costoBaseDiseno.toFixed(2)}</div>
					<div>Diseño (entregables): Bs {costoEntregables.toFixed(2)}</div>
					<div className="mt-1">
						Construcción (base): Bs {costoBaseConstruccion.toFixed(2)}
					</div>
					<div>
						Construcción (ejecutables): Bs {costoEjecutables.toFixed(2)}
					</div>
					<div className="mt-2 font-semibold">TOTAL: Bs {total.toFixed(2)}</div>
				</section>

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
						disabled={saving}
						className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
					>
						{saving ? "Guardando…" : "Generar Cotización"}
					</button>
				</div>
			</form>
		</FormProvider>
	);
};

export default QuoteForm;
