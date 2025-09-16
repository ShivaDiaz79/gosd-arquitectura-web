"use client";

import { useEffect, useMemo, useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import Button from "@/components/ui/button/Button";
import RHFInput from "@/components/form/RHFInput";
import RHFSelect from "@/components/form/RHFSelect";
import { CotizadorService } from "@/services/CotizadorService";
import type {
	CotizadorConfig,
	EjecutableNode,
} from "@/services/CotizadorService";

const slug = (s: string) =>
	s
		.toLowerCase()
		.normalize("NFD")
		.replace(/\p{Diacritic}/gu, "")
		.replace(/\s+/g, "_")
		.replace(/[^a-z0-9_]/g, "");

function flattenLeaves(nodes: EjecutableNode[], path: string[] = []) {
	const out: {
		value: string;
		label: string;
		pathLabel: string;
		pathValues: string[];
	}[] = [];
	for (const n of nodes) {
		const p = [...path, n.label];
		if (!n.children || n.children.length === 0) {
			out.push({
				value: n.value,
				label: n.label,
				pathLabel: p.join(" → "),
				pathValues: [],
			});
		} else {
			out.push(...flattenLeaves(n.children, p));
		}
	}
	return out.sort((a, b) => a.pathLabel.localeCompare(b.pathLabel));
}

function flattenAll(
	nodes: EjecutableNode[],
	depth = 0,
	path: { label: string; value: string }[] = []
) {
	const out: {
		node: EjecutableNode;
		depth: number;
		path: { label: string; value: string }[];
	}[] = [];
	for (const n of nodes) {
		const p = [...path, { label: n.label, value: n.value }];
		out.push({ node: n, depth, path: p });
		if (n.children && n.children.length)
			out.push(...flattenAll(n.children, depth + 1, p));
	}
	return out;
}

type FAdd = {
	parent1?: string;
	parent2?: string;
	parent3?: string;
	label: string;
	value: string;
};
type FTarif = { tarifas: Record<string, number | string> };
type FRangos = {
	leaf: string;
	rangos: { min: string; max: string; tarifa_m2: string }[];
	min: string;
	max: string;
	tarifa_m2: string;
};
type FMatriz = { l1: string; l2: string; l3: string; leaves: string[] };

export default function EjecutablesConstruccionTreeAdmin() {
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

	const tree = cfg?.EJECUTABLES_CONSTRUCCION_TREE || [];
	const L1 = cfg?.CATEGORIA_L1 || [];
	const L2 = cfg?.CATEGORIA_L2 || {};
	const L3 = cfg?.CATEGORIA_L3 || {};
	const TAR = cfg?.TARIFAS_EJECUTABLES_M2 || {};
	const RAN = cfg?.RANGOS_SUPERFICIE_EJECUTABLES || {};
	const MAT = cfg?.MATRIZ_EJECUTABLES_POR_CATEGORIA || {};

	const leaves = useMemo(() => flattenLeaves(tree), [tree]);
	const allNodes = useMemo(() => flattenAll(tree), [tree]);

	const fAdd = useForm<FAdd>({
		defaultValues: {
			parent1: "",
			parent2: "",
			parent3: "",
			label: "",
			value: "",
		},
		mode: "onTouched",
	});

	const parent1Opts = useMemo(
		() => tree.map((n) => ({ value: n.value, label: n.label })),
		[tree]
	);
	const parent1 = fAdd.watch("parent1");
	const parent2Opts = useMemo(() => {
		const p =
			allNodes.find((x) => x.node.value === parent1)?.node.children || [];
		return p.map((n) => ({ value: n.value, label: n.label }));
	}, [allNodes, parent1]);
	const parent2 = fAdd.watch("parent2");
	const parent3Opts = useMemo(() => {
		const p =
			allNodes.find((x) => x.node.value === parent2)?.node.children || [];
		return p.map((n) => ({ value: n.value, label: n.label }));
	}, [allNodes, parent2]);

	useEffect(() => {
		fAdd.setValue("parent2", "");
		fAdd.setValue("parent3", "");
	}, [parent1]);
	useEffect(() => {
		fAdd.setValue("parent3", "");
	}, [parent2]);

	const onBlurLabel = () => {
		const { value, label } = fAdd.getValues();
		if (!value && label)
			fAdd.setValue("value", slug(label), { shouldDirty: true });
	};

	const addNode = async (d: FAdd) => {
		setSaving(true);
		setError(null);
		try {
			const parent = d.parent3 || d.parent2 || d.parent1 || null;
			const label = d.label.trim();
			const value = (d.value || slug(label)).trim();
			if (label.length < 2 || !/^[a-z0-9_]+$/.test(value))
				throw new Error("Datos inválidos");
			const nextTree = await CotizadorService.addEjecutableNode({
				parentValue: parent,
				label,
				value,
			});
			setCfg((p) =>
				p ? { ...p, EJECUTABLES_CONSTRUCCION_TREE: nextTree } : p
			);
			fAdd.reset({
				parent1: parent ?? "",
				parent2: "",
				parent3: "",
				label: "",
				value: "",
			});
		} catch (e: any) {
			setError(e?.message || "No se pudo agregar el nodo.");
		} finally {
			setSaving(false);
		}
	};

	const removeNode = async (value: string) => {
		if (
			!confirm(
				"¿Eliminar este nodo y todo su subárbol? Se limpiarán tarifas, rangos y matriz de las hojas afectadas."
			)
		)
			return;
		setSaving(true);
		try {
			const nextTree = await CotizadorService.removeEjecutableNode(value);
			setCfg((p) =>
				p ? { ...p, EJECUTABLES_CONSTRUCCION_TREE: nextTree } : p
			);
		} catch (e: any) {
			setError(e?.message || "No se pudo eliminar el nodo.");
		} finally {
			setSaving(false);
		}
	};

	const fTar = useForm<FTarif>({
		defaultValues: { tarifas: {} },
		mode: "onTouched",
	});
	useEffect(() => {
		const initial: Record<string, number | string> = {};
		for (const l of leaves) initial[l.value] = TAR[l.value] ?? "";
		fTar.reset({ tarifas: initial });
	}, [JSON.stringify(leaves), JSON.stringify(TAR)]);

	const saveTar = async (d: FTarif) => {
		setSaving(true);
		setError(null);
		try {
			const clean: Record<string, number> = {};
			for (const [k, v] of Object.entries(d.tarifas || {})) {
				const n = typeof v === "string" ? parseFloat(v) : v;
				if (Number.isFinite(n)) clean[k] = n as number;
			}
			const next = await CotizadorService.bulkSetTarifasEjecutablesM2(clean);
			setCfg((p) => (p ? { ...p, TARIFAS_EJECUTABLES_M2: next } : p));
		} catch (e: any) {
			setError(e?.message || "No se pudieron guardar tarifas.");
		} finally {
			setSaving(false);
		}
	};

	const fRan = useForm<FRangos>({
		defaultValues: { leaf: "", rangos: [], min: "", max: "", tarifa_m2: "" },
		mode: "onTouched",
	});
	const leafOpts = leaves.map((l) => ({ value: l.value, label: l.pathLabel }));
	const selLeaf = fRan.watch("leaf");
	useEffect(() => {
		const rs = (RAN[selLeaf] || []).map((r) => ({
			min: String(r.min),
			max: r.max == null ? "" : String(r.max),
			tarifa_m2: String(r.tarifa_m2),
		}));
		fRan.setValue("rangos", rs);
	}, [selLeaf]);
	const addRango = () => {
		const min = parseFloat(fRan.getValues("min") || "");
		const maxStr = fRan.getValues("max") || "";
		const max = maxStr === "" ? undefined : parseFloat(maxStr);
		const t = parseFloat(fRan.getValues("tarifa_m2") || "");
		if (
			!selLeaf ||
			!Number.isFinite(min) ||
			(max !== undefined && !Number.isFinite(max)) ||
			!Number.isFinite(t) ||
			(max !== undefined && max <= min)
		) {
			alert("Valores inválidos");
			return;
		}
		const curr = fRan.getValues("rangos") || [];
		const overlap = curr.some((r) => {
			const a1 = min,
				a2 = max ?? 1e20,
				b1 = parseFloat(r.min),
				b2 = r.max === "" ? 1e20 : parseFloat(r.max);
			return Math.max(a1, b1) < Math.min(a2, b2);
		});
		if (overlap) {
			alert("Rango se superpone");
			return;
		}
		const next = [
			...curr,
			{ min: String(min), max: maxStr, tarifa_m2: String(t) },
		].sort((a, b) => parseFloat(a.min) - parseFloat(b.min));
		fRan.setValue("rangos", next);
		fRan.setValue("min", "");
		fRan.setValue("max", "");
		fRan.setValue("tarifa_m2", "");
	};
	const saveRangos = async (d: FRangos) => {
		if (!selLeaf) {
			alert("Seleccione una hoja");
			return;
		}
		setSaving(true);
		try {
			const payload = (d.rangos || []).map((r) => ({
				min: parseFloat(r.min),
				max: r.max === "" ? undefined : parseFloat(r.max),
				tarifa_m2: parseFloat(r.tarifa_m2),
			}));
			const next = await CotizadorService.setRangosSuperficieEjecutable(
				selLeaf,
				payload
			);
			setCfg((p) => (p ? { ...p, RANGOS_SUPERFICIE_EJECUTABLES: next } : p));
		} catch (e: any) {
			setError(e?.message || "No se pudieron guardar rangos.");
		} finally {
			setSaving(false);
		}
	};

	const fMat = useForm<FMatriz>({
		defaultValues: { l1: "", l2: "", l3: "", leaves: [] },
		mode: "onTouched",
	});
	const l1Sel = fMat.watch("l1");
	const l2Sel = fMat.watch("l2");
	useEffect(() => {
		fMat.setValue("l2", "");
		fMat.setValue("l3", "");
	}, [l1Sel]);
	useEffect(() => {
		fMat.setValue("l3", "");
	}, [l2Sel]);
	const l2Opts = useMemo(() => (l1Sel ? L2[l1Sel] || [] : []), [L2, l1Sel]);
	const l3Opts = useMemo(() => (l2Sel ? L3[l2Sel] || [] : []), [L3, l2Sel]);
	const catKey = (fMat.watch("l3") ||
		fMat.watch("l2") ||
		fMat.watch("l1") ||
		"") as string;
	useEffect(() => {
		fMat.setValue("leaves", MAT[catKey] || []);
	}, [catKey]);

	const leavesByTop = useMemo(() => {
		const topMap = new Map<
			string,
			{ title: string; items: { value: string; label: string }[] }
		>();
		const walk = (nodes: EjecutableNode[], topTitle?: string) => {
			for (const n of nodes) {
				const t = topTitle ?? n.label;
				if (!n.children || n.children.length === 0) {
					const group = topMap.get(t) || { title: t, items: [] };
					group.items.push({ value: n.value, label: n.label });
					topMap.set(t, group);
				} else {
					walk(n.children, t);
				}
			}
		};
		walk(tree);
		return Array.from(topMap.values());
	}, [tree]);

	const saveMatriz = async (d: FMatriz) => {
		setSaving(true);
		try {
			const key = (d.l3 || d.l2 || d.l1 || "").trim();
			if (!key) {
				alert("Seleccione al menos L1");
				setSaving(false);
				return;
			}
			const next = await CotizadorService.setMatrizEjecutablesCategoria(
				key,
				d.leaves || []
			);
			setCfg((p) => (p ? { ...p, MATRIZ_EJECUTABLES_POR_CATEGORIA: next } : p));
		} catch (e: any) {
			setError(e?.message || "No se pudo guardar la matriz.");
		} finally {
			setSaving(false);
		}
	};

	return (
		<div className="space-y-10">
			{loading && <div className="text-sm text-gray-500">Cargando…</div>}
			{error && <div className="text-sm text-red-600">{error}</div>}

			<section className="space-y-4 rounded-lg border p-4">
				<h2 className="text-lg font-semibold">
					Árbol de ejecutables (N niveles)
				</h2>

				<FormProvider {...fAdd}>
					<form onSubmit={fAdd.handleSubmit(addNode)} className="space-y-4">
						<div className="grid sm:grid-cols-5 gap-4">
							<RHFSelect
								name="parent1"
								label="Padre nivel 1"
								placeholder="(raíz)"
								options={parent1Opts}
							/>
							<RHFSelect
								name="parent2"
								label="Padre nivel 2"
								placeholder="—"
								options={parent2Opts}
								disabled={!parent1}
							/>
							<RHFSelect
								name="parent3"
								label="Padre nivel 3"
								placeholder="—"
								options={parent3Opts}
								disabled={!parent2}
							/>
							<RHFInput
								name="label"
								label="Nombre"
								placeholder="Ej.: Cortinas"
								onBlur={onBlurLabel}
								required
								minLength={2}
							/>
							<RHFInput
								name="value"
								label="Slug"
								placeholder="cortinas"
								pattern="^[a-z0-9_]+$"
							/>
						</div>
						<div className="flex gap-2">
							<Button type="submit" disabled={saving}>
								{saving ? "Guardando…" : "Agregar nodo"}
							</Button>
							<Button
								type="button"
								variant="outline"
								onClick={() =>
									fAdd.reset({
										parent1: parent1 || "",
										parent2: "",
										parent3: "",
										label: "",
										value: "",
									})
								}
								disabled={saving}
							>
								Limpiar
							</Button>
						</div>
					</form>
				</FormProvider>

				<div className="rounded-lg border">
					<div className="px-4 py-2 text-xs font-medium text-gray-500">
						Estructura actual
					</div>
					<div className="divide-y">
						{allNodes.length === 0 && (
							<div className="px-4 py-4 text-sm text-gray-500">Sin nodos.</div>
						)}
						{allNodes.map(({ node, depth, path }) => (
							<div
								key={node.value}
								className="px-4 py-2 flex items-center justify-between"
							>
								<div className="text-sm" style={{ paddingLeft: depth * 16 }}>
									{path.map((p, i) => (
										<span key={p.value}>
											{i > 0 && " → "}
											{i === path.length - 1 ? <b>{p.label}</b> : p.label}
										</span>
									))}
									{!node.children || node.children.length === 0 ? (
										<span className="ml-2 text-xs text-gray-500">(hoja)</span>
									) : null}
								</div>
								<div className="flex gap-2">
									<Button
										size="sm"
										variant="outline"
										onClick={() => removeNode(node.value)}
										disabled={saving}
									>
										Eliminar
									</Button>
								</div>
							</div>
						))}
					</div>
				</div>

				<p className="text-xs text-gray-500">
					Las <b>tarifas</b>, <b>rangos</b> y la <b>matriz por categoría</b> se
					aplican a <u>hojas</u> del árbol.
				</p>
			</section>

			<section className="space-y-4 rounded-lg border p-4">
				<h2 className="text-lg font-semibold">Tarifas por m² (solo hojas)</h2>
				<FormProvider {...fTar}>
					<form
						onSubmit={fTar.handleSubmit(saveTar)}
						className="grid md:grid-cols-2 gap-4"
					>
						{leaves.map((l) => (
							<Controller
								key={l.value}
								name={`tarifas.${l.value}` as const}
								render={({ field }) => (
									<RHFInput
										name={field.name}
										label={`${l.pathLabel} (Bs/m²)`}
										type="number"
										step="0.01"
										inputMode="decimal"
										placeholder="0.00"
										onChange={(e) => field.onChange(e.target.value)}
									/>
								)}
							/>
						))}
						<div className="md:col-span-2">
							<Button type="submit" disabled={saving}>
								{saving ? "Guardando…" : "Guardar tarifas"}
							</Button>
						</div>
					</form>
				</FormProvider>
			</section>

			<section className="space-y-4 rounded-lg border p-4">
				<h2 className="text-lg font-semibold">Rangos por superficie</h2>
				<FormProvider {...fRan}>
					<form onSubmit={fRan.handleSubmit(saveRangos)} className="space-y-4">
						<div className="grid sm:grid-cols-3 gap-4">
							<RHFSelect
								name="leaf"
								label="Hoja"
								placeholder="Seleccione…"
								options={leafOpts}
							/>
							<div className="sm:col-span-2 grid grid-cols-3 gap-3">
								<RHFInput
									name="min"
									label="Min (incl.)"
									type="number"
									step="1"
									placeholder="0"
								/>
								<RHFInput
									name="max"
									label="Max (opc.)"
									type="number"
									step="1"
									placeholder="299"
								/>
								<RHFInput
									name="tarifa_m2"
									label="Tarifa Bs/m²"
									type="number"
									step="0.01"
									placeholder="0.00"
								/>
								<div className="col-span-3">
									<Button
										type="button"
										variant="outline"
										onClick={addRango}
										disabled={saving}
									>
										Añadir rango
									</Button>
								</div>
							</div>
						</div>

						<div className="rounded-lg border">
							<div className="grid grid-cols-12 px-4 py-2 text-xs font-medium text-gray-500">
								<div className="col-span-3">Min</div>
								<div className="col-span-3">Max</div>
								<div className="col-span-4">Tarifa (Bs/m²)</div>
								<div className="col-span-2 text-right">Acciones</div>
							</div>
							<div className="divide-y">
								{(fRan.watch("rangos") || []).length === 0 && (
									<div className="px-4 py-4 text-sm text-gray-500">
										Sin rangos.
									</div>
								)}
								{(fRan.watch("rangos") || []).map((r, i) => (
									<div
										key={i}
										className="grid grid-cols-12 px-4 py-3 items-center"
									>
										<div className="col-span-3 text-sm">{r.min}</div>
										<div className="col-span-3 text-sm">{r.max || "—"}</div>
										<div className="col-span-4 text-sm">{r.tarifa_m2}</div>
										<div className="col-span-2 flex justify-end">
											<Button
												size="sm"
												variant="outline"
												onClick={() => {
													const curr = fRan.getValues("rangos") || [];
													fRan.setValue(
														"rangos",
														curr.filter((_, idx) => idx !== i)
													);
												}}
												disabled={saving}
											>
												Eliminar
											</Button>
										</div>
									</div>
								))}
							</div>
						</div>

						<Button type="submit" disabled={saving || !selLeaf}>
							{saving ? "Guardando…" : "Guardar rangos"}
						</Button>
					</form>
				</FormProvider>
			</section>

			<section className="space-y-4 rounded-lg border p-4">
				<h2 className="text-lg font-semibold">
					Matriz de ejecutables por categoría
				</h2>
				<FormProvider {...fMat}>
					<form onSubmit={fMat.handleSubmit(saveMatriz)} className="space-y-4">
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
								options={l2Opts}
								disabled={!l1Sel}
							/>
							<RHFSelect
								name="l3"
								label="Categoría L3"
								placeholder="Opcional"
								options={l3Opts}
								disabled={!l2Sel}
							/>
						</div>

						<Controller
							name="leaves"
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
										{leavesByTop.map((group) => (
											<div key={group.title}>
												<div className="text-sm font-medium mb-2">
													{group.title}
												</div>
												<div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
													{group.items.map((i) => (
														<label
															key={i.value}
															className="flex items-center gap-2 text-sm"
														>
															<input
																type="checkbox"
																className="h-4 w-4 rounded border-gray-300"
																checked={selected.includes(i.value)}
																onChange={() => toggle(i.value)}
															/>
															<span>{i.label}</span>
														</label>
													))}
												</div>
											</div>
										))}
									</div>
								);
							}}
						/>

						<Button type="submit" disabled={saving || !catKey}>
							{saving ? "Guardando…" : "Guardar matriz"}
						</Button>
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
										.map(
											(v) => leaves.find((l) => l.value === v)?.pathLabel || v
										)
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
