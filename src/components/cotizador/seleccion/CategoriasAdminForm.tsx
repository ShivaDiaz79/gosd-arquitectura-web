"use client";

import { useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import Button from "@/components/ui/button/Button";
import RHFInput from "@/components/form/RHFInput";
import RHFSelect from "@/components/form/RHFSelect";
import { CotizadorService } from "@/services/CotizadorService";
import type { CotizadorConfig } from "@/services/CotizadorService";

function slugify(input: string) {
	return input
		.toLowerCase()
		.normalize("NFD")
		.replace(/\p{Diacritic}/gu, "")
		.replace(/\s+/g, "_")
		.replace(/[^a-z0-9_]/g, "");
}

type FormL1 = { l1_label: string; l1_value: string };
type FormL2 = { parent_l1: string; l2_label: string; l2_value: string };
type FormL3 = { parent_l2: string; l3_label: string; l3_value: string };

export default function CategoriasAdminForm() {
	const [config, setConfig] = useState<CotizadorConfig | null>(null);
	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let mounted = true;
		(async () => {
			setLoading(true);
			try {
				const c = await CotizadorService.getConfig();
				if (mounted) setConfig(c);
			} catch (e: any) {
				setError(e?.message || "No se pudo cargar la configuración.");
			} finally {
				setLoading(false);
			}
		})();
		return () => {
			mounted = false;
		};
	}, []);

	const L1 = config?.CATEGORIA_L1 || [];
	const L2 = config?.CATEGORIA_L2 || {};
	const L3 = config?.CATEGORIA_L3 || {};

	const fL1 = useForm<FormL1>({
		defaultValues: { l1_label: "", l1_value: "" },
		mode: "onTouched",
	});
	const fL2 = useForm<FormL2>({
		defaultValues: { parent_l1: "", l2_label: "", l2_value: "" },
		mode: "onTouched",
	});
	const fL3 = useForm<FormL3>({
		defaultValues: { parent_l2: "", l3_label: "", l3_value: "" },
		mode: "onTouched",
	});

	const onBlurL1Label = () => {
		const { l1_label, l1_value } = fL1.getValues();
		if (!l1_value && l1_label)
			fL1.setValue("l1_value", slugify(l1_label), { shouldDirty: true });
	};
	const onBlurL2Label = () => {
		const { l2_label, l2_value } = fL2.getValues();
		if (!l2_value && l2_label)
			fL2.setValue("l2_value", slugify(l2_label), { shouldDirty: true });
	};
	const onBlurL3Label = () => {
		const { l3_label, l3_value } = fL3.getValues();
		if (!l3_value && l3_label)
			fL3.setValue("l3_value", slugify(l3_label), { shouldDirty: true });
	};

	const validateSlug = (v: string) => /^[a-z0-9_]+$/.test(v || "");

	const submitL1 = async (data: FormL1) => {
		setSaving(true);
		setError(null);
		const label = (data.l1_label || "").trim();
		const value = (data.l1_value || "").trim();
		if (label.length < 2) {
			fL1.setError("l1_label", {
				type: "manual",
				message: "Mínimo 2 caracteres",
			});
			setSaving(false);
			return;
		}
		if (!validateSlug(value)) {
			fL1.setError("l1_value", {
				type: "manual",
				message: "Solo minúsculas, números y _",
			});
			setSaving(false);
			return;
		}

		try {
			const next = await CotizadorService.addCategoriaL1({ label, value });
			setConfig((prev) => (prev ? { ...prev, CATEGORIA_L1: next } : prev));
			fL1.reset({ l1_label: "", l1_value: "" });
		} catch (e: any) {
			setError(e?.message || "No se pudo guardar L1.");
		} finally {
			setSaving(false);
		}
	};

	const removeL1 = async (value: string) => {
		if (!confirm("¿Eliminar esta categoría L1 y sus subcategorías?")) return;
		setSaving(true);
		setError(null);
		try {
			const next = await CotizadorService.removeCategoriaL1(value);
			setConfig((prev) =>
				prev
					? {
							...prev,
							CATEGORIA_L1: next.L1,
							CATEGORIA_L2: next.L2 as any,
							CATEGORIA_L3: next.L3 as any,
					  }
					: prev
			);
		} catch (e: any) {
			setError(e?.message || "No se pudo eliminar L1.");
		} finally {
			setSaving(false);
		}
	};

	const submitL2 = async (data: FormL2) => {
		setSaving(true);
		setError(null);
		const parent = (data.parent_l1 || "").trim();
		const label = (data.l2_label || "").trim();
		const value = (data.l2_value || "").trim();
		if (!parent) {
			fL2.setError("parent_l1", { type: "manual", message: "Seleccione L1" });
			setSaving(false);
			return;
		}
		if (label.length < 2) {
			fL2.setError("l2_label", {
				type: "manual",
				message: "Mínimo 2 caracteres",
			});
			setSaving(false);
			return;
		}
		if (!validateSlug(value)) {
			fL2.setError("l2_value", {
				type: "manual",
				message: "Solo minúsculas, números y _",
			});
			setSaving(false);
			return;
		}

		try {
			const next = await CotizadorService.addCategoriaL2(parent, {
				label,
				value,
			});
			setConfig((prev) => (prev ? { ...prev, CATEGORIA_L2: next } : prev));
			fL2.reset({ parent_l1: parent, l2_label: "", l2_value: "" });
		} catch (e: any) {
			setError(e?.message || "No se pudo guardar L2.");
		} finally {
			setSaving(false);
		}
	};

	const removeL2 = async (parentL1: string, valueL2: string) => {
		if (!confirm("¿Eliminar esta categoría L2 y sus subcategorías L3?")) return;
		setSaving(true);
		setError(null);
		try {
			const next = await CotizadorService.removeCategoriaL2(parentL1, valueL2);
			setConfig((prev) =>
				prev
					? {
							...prev,
							CATEGORIA_L2: next.L2 as any,
							CATEGORIA_L3: next.L3 as any,
					  }
					: prev
			);
		} catch (e: any) {
			setError(e?.message || "No se pudo eliminar L2.");
		} finally {
			setSaving(false);
		}
	};

	const submitL3 = async (data: FormL3) => {
		setSaving(true);
		setError(null);
		const parent = (data.parent_l2 || "").trim();
		const label = (data.l3_label || "").trim();
		const value = (data.l3_value || "").trim();
		if (!parent) {
			fL3.setError("parent_l2", { type: "manual", message: "Seleccione L2" });
			setSaving(false);
			return;
		}
		if (label.length < 2) {
			fL3.setError("l3_label", {
				type: "manual",
				message: "Mínimo 2 caracteres",
			});
			setSaving(false);
			return;
		}
		if (!validateSlug(value)) {
			fL3.setError("l3_value", {
				type: "manual",
				message: "Solo minúsculas, números y _",
			});
			setSaving(false);
			return;
		}

		try {
			const next = await CotizadorService.addCategoriaL3(parent, {
				label,
				value,
			});
			setConfig((prev) => (prev ? { ...prev, CATEGORIA_L3: next } : prev));
			fL3.reset({ parent_l2: parent, l3_label: "", l3_value: "" });
		} catch (e: any) {
			setError(e?.message || "No se pudo guardar L3.");
		} finally {
			setSaving(false);
		}
	};

	const removeL3 = async (parentL2: string, valueL3: string) => {
		if (!confirm("¿Eliminar esta categoría L3?")) return;
		setSaving(true);
		setError(null);
		try {
			const next = await CotizadorService.removeCategoriaL3(parentL2, valueL3);
			setConfig((prev) =>
				prev ? { ...prev, CATEGORIA_L3: next.L3 as any } : prev
			);
		} catch (e: any) {
			setError(e?.message || "No se pudo eliminar L3.");
		} finally {
			setSaving(false);
		}
	};

	const l2FlatOptions = useMemo(() => {
		const opts: { value: string; label: string }[] = [];
		for (const l1 of L1) {
			for (const l2 of L2[l1.value] || []) {
				opts.push({ value: l2.value, label: `${l1.label} → ${l2.label}` });
			}
		}
		return opts;
	}, [L1, L2]);

	return (
		<div className="space-y-10">
			{loading && <div className="text-sm text-gray-500">Cargando…</div>}
			{error && <div className="text-sm text-red-600">{error}</div>}

			<section className="space-y-4 rounded-lg border border-gray-200 p-4">
				<h2 className="text-lg font-semibold">Nivel 1 (L1)</h2>
				<FormProvider {...fL1}>
					<form onSubmit={fL1.handleSubmit(submitL1)} className="space-y-4">
						<div className="grid sm:grid-cols-2 gap-4">
							<RHFInput
								name="l1_label"
								label="Etiqueta L1"
								placeholder="Ej.: VIVIENDA MULTIFAMILIAR"
								onBlur={onBlurL1Label}
								required
								minLength={2}
							/>
							<RHFInput
								name="l1_value"
								label="Valor (slug)"
								placeholder="Ej.: vivienda_multifamiliar"
								required
								pattern="^[a-z0-9_]+$"
								minLength={2}
							/>
						</div>
						<div className="flex gap-2">
							<Button type="submit" disabled={saving}>
								{saving ? "Guardando…" : "Agregar L1"}
							</Button>
							<Button
								type="button"
								variant="outline"
								onClick={() => fL1.reset({ l1_label: "", l1_value: "" })}
								disabled={saving}
							>
								Limpiar
							</Button>
						</div>
					</form>
				</FormProvider>

				<div className="rounded-lg border border-gray-200">
					<div className="grid grid-cols-12 px-4 py-2 text-xs font-medium text-gray-500">
						<div className="col-span-6">Etiqueta</div>
						<div className="col-span-4">Valor</div>
						<div className="col-span-2 text-right">Acciones</div>
					</div>
					<div className="divide-y">
						{L1.length === 0 && (
							<div className="px-4 py-4 text-sm text-gray-500">
								Sin categorías L1.
							</div>
						)}
						{L1.map((o) => (
							<div
								key={o.value}
								className="grid grid-cols-12 px-4 py-3 items-center"
							>
								<div className="col-span-6 text-sm">{o.label}</div>
								<div className="col-span-4">
									<code className="text-xs bg-gray-50 px-2 py-1 rounded">
										{o.value}
									</code>
								</div>
								<div className="col-span-2 flex justify-end">
									<Button
										size="sm"
										variant="outline"
										onClick={() => removeL1(o.value)}
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

			<section className="space-y-4 rounded-lg border border-gray-200 p-4">
				<h2 className="text-lg font-semibold">Nivel 2 (L2)</h2>
				<FormProvider {...fL2}>
					<form onSubmit={fL2.handleSubmit(submitL2)} className="space-y-4">
						<div className="grid sm:grid-cols-3 gap-4">
							<RHFSelect
								name="parent_l1"
								label="Padre (L1)"
								placeholder="Seleccione L1…"
								options={L1}
							/>
							<RHFInput
								name="l2_label"
								label="Etiqueta L2"
								placeholder="Ej.: URBANIZACIONES HORIZONTALES"
								onBlur={onBlurL2Label}
								required
								minLength={2}
							/>
							<RHFInput
								name="l2_value"
								label="Valor (slug)"
								placeholder="Ej.: urbanizaciones_horizontales"
								required
								pattern="^[a-z0-9_]+$"
								minLength={2}
							/>
						</div>
						<div className="flex gap-2">
							<Button type="submit" disabled={saving}>
								{saving ? "Guardando…" : "Agregar L2"}
							</Button>
							<Button
								type="button"
								variant="outline"
								onClick={() =>
									fL2.reset({
										parent_l1: fL2.getValues("parent_l1") || "",
										l2_label: "",
										l2_value: "",
									})
								}
								disabled={saving}
							>
								Limpiar
							</Button>
						</div>
					</form>
				</FormProvider>

				<div className="rounded-lg border border-gray-200">
					<div className="grid grid-cols-12 px-4 py-2 text-xs font-medium text-gray-500">
						<div className="col-span-3">Padre (L1)</div>
						<div className="col-span-5">Etiqueta</div>
						<div className="col-span-2">Valor</div>
						<div className="col-span-2 text-right">Acciones</div>
					</div>
					<div className="divide-y">
						{L1.length === 0 && (
							<div className="px-4 py-4 text-sm text-gray-500">
								Sin L1 definidos.
							</div>
						)}
						{L1.map((parent) =>
							(L2[parent.value] || []).map((o) => (
								<div
									key={`${parent.value}__${o.value}`}
									className="grid grid-cols-12 px-4 py-3 items-center"
								>
									<div className="col-span-3 text-sm">{parent.label}</div>
									<div className="col-span-5 text-sm">{o.label}</div>
									<div className="col-span-2">
										<code className="text-xs bg-gray-50 px-2 py-1 rounded">
											{o.value}
										</code>
									</div>
									<div className="col-span-2 flex justify-end">
										<Button
											size="sm"
											variant="outline"
											onClick={() => removeL2(parent.value, o.value)}
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

			<section className="space-y-4 rounded-lg border border-gray-200 p-4">
				<h2 className="text-lg font-semibold">Nivel 3 (L3)</h2>
				<FormProvider {...fL3}>
					<form onSubmit={fL3.handleSubmit(submitL3)} className="space-y-4">
						<div className="grid sm:grid-cols-3 gap-4">
							<RHFSelect
								name="parent_l2"
								label="Padre (L2)"
								placeholder="Seleccione L2…"
								options={l2FlatOptions}
							/>
							<RHFInput
								name="l3_label"
								label="Etiqueta L3"
								placeholder="Ej.: PROYECTO URBANÍSTICO"
								onBlur={onBlurL3Label}
								required
								minLength={2}
							/>
							<RHFInput
								name="l3_value"
								label="Valor (slug)"
								placeholder="Ej.: proyecto_urbanistico"
								required
								pattern="^[a-z0-9_]+$"
								minLength={2}
							/>
						</div>
						<div className="flex gap-2">
							<Button type="submit" disabled={saving}>
								{saving ? "Guardando…" : "Agregar L3"}
							</Button>
							<Button
								type="button"
								variant="outline"
								onClick={() =>
									fL3.reset({
										parent_l2: fL3.getValues("parent_l2") || "",
										l3_label: "",
										l3_value: "",
									})
								}
								disabled={saving}
							>
								Limpiar
							</Button>
						</div>
					</form>
				</FormProvider>

				<div className="rounded-lg border border-gray-200">
					<div className="grid grid-cols-12 px-4 py-2 text-xs font-medium text-gray-500">
						<div className="col-span-4">Padre (L2)</div>
						<div className="col-span-4">Etiqueta</div>
						<div className="col-span-2">Valor</div>
						<div className="col-span-2 text-right">Acciones</div>
					</div>
					<div className="divide-y">
						{Object.keys(L2).length === 0 && (
							<div className="px-4 py-4 text-sm text-gray-500">
								Sin L2 definidos.
							</div>
						)}
						{Object.entries(L2).flatMap(([l1Val, l2Arr]) =>
							(l2Arr || []).map((l2) =>
								(L3[l2.value] || []).map((o) => (
									<div
										key={`${l2.value}__${o.value}`}
										className="grid grid-cols-12 px-4 py-3 items-center"
									>
										<div className="col-span-4 text-sm">
											<span className="font-medium">
												{L1.find((x) => x.value === l1Val)?.label || l1Val}
											</span>
											{" → "}
											<span>{l2.label}</span>
										</div>
										<div className="col-span-4 text-sm">{o.label}</div>
										<div className="col-span-2">
											<code className="text-xs bg-gray-50 px-2 py-1 rounded">
												{o.value}
											</code>
										</div>
										<div className="col-span-2 flex justify-end">
											<Button
												size="sm"
												variant="outline"
												onClick={() => removeL3(l2.value, o.value)}
												disabled={saving}
											>
												Eliminar
											</Button>
										</div>
									</div>
								))
							)
						)}
					</div>
				</div>
			</section>
		</div>
	);
}
