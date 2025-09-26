"use client";

import { FormProvider, useForm, useWatch } from "react-hook-form";
import { useEffect, useMemo, useState } from "react";
import Button from "@/components/ui/button/Button";
import RHFInput from "@/components/form/RHFInput";
import RHFFileInput from "@/components/form/RHFFileInput";
import type { MaterialRow, MaterialImage } from "@/lib/types/material.type";
import { MaterialsService } from "@/services/MaterialsService";

type FormValues = {
	description: string;
	unit: string;
	priceBs: number | string;
	priceUsd: number | string;
	minStock: number | string | null;
	addFiles: FileList | null;
	tc: number | string;
};

export default function MaterialForm({
	material,
	onSaved,
}: {
	material?: MaterialRow | null;
	onSaved?: (id: string) => void;
}) {
	const methods = useForm<FormValues>({
		defaultValues: {
			description: material?.description ?? "",
			unit: material?.unit ?? "",
			priceBs: material?.priceBs ?? "",
			priceUsd: material?.priceUsd ?? "",
			minStock: material?.minStock ?? "",
			addFiles: null,
			tc: 6.96,
		},
	});

	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [ok, setOk] = useState<string | null>(null);
	const [existing, setExisting] = useState<MaterialImage[]>(
		material?.images ?? []
	);
	const [toRemove, setToRemove] = useState<Set<string>>(new Set());

	useEffect(() => {
		methods.reset({
			description: material?.description ?? "",
			unit: material?.unit ?? "",
			priceBs: material?.priceBs ?? "",
			priceUsd: material?.priceUsd ?? "",
			minStock: material?.minStock ?? "",
			addFiles: null,
			tc: 6.96,
		});
		setExisting(material?.images ?? []);
		setToRemove(new Set());
		setError(null);
		setOk(null);
	}, [material?.id, methods]);

	const addFiles = useWatch({ control: methods.control, name: "addFiles" });
	const previewFiles = useMemo(() => {
		if (!addFiles || addFiles.length === 0) return [];
		return Array.from(addFiles).map((f) => ({
			name: f.name,
			url: URL.createObjectURL(f),
		}));
	}, [addFiles]);

	function toggleRemove(path: string) {
		setToRemove((prev) => {
			const n = new Set(prev);
			n.has(path) ? n.delete(path) : n.add(path);
			return n;
		});
	}

	function autoCalc(v: FormValues): FormValues {
		const tc = Number(v.tc) || 0;
		const bs = Number(v.priceBs);
		const usd = Number(v.priceUsd);
		if (!isNaN(bs) && bs > 0 && (isNaN(usd) || usd === 0) && tc > 0)
			v.priceUsd = +(bs / tc).toFixed(2);
		else if (!isNaN(usd) && usd > 0 && (isNaN(bs) || bs === 0) && tc > 0)
			v.priceBs = +(usd * tc).toFixed(2);
		return v;
	}

	const onSubmit = methods.handleSubmit(async (vals) => {
		setSaving(true);
		setError(null);
		setOk(null);
		const v = autoCalc({ ...vals });

		try {
			if (material) {
				await MaterialsService.update(material.id, {
					description: v.description,
					unit: v.unit,
					priceBs: Number(v.priceBs) || 0,
					priceUsd: Number(v.priceUsd) || 0,
					minStock: v.minStock === "" ? null : Number(v.minStock),
					addFiles: v.addFiles ? Array.from(v.addFiles) : [],
					removePaths: Array.from(toRemove),
				});
				setOk("Material actualizado.");
				onSaved?.(material.id);
			} else {
				const res = await MaterialsService.create({
					description: v.description,
					unit: v.unit,
					priceBs: Number(v.priceBs) || 0,
					priceUsd: Number(v.priceUsd) || 0,
					minStock: v.minStock === "" ? undefined : Number(v.minStock),
					files: v.addFiles ? Array.from(v.addFiles) : [],
				});
				setOk("Material creado.");
				methods.reset({
					description: "",
					unit: "",
					priceBs: "",
					priceUsd: "",
					minStock: "",
					addFiles: null,
					tc: 6.96,
				});
				setExisting([]);
				setToRemove(new Set());
				onSaved?.(res.id);
			}
		} catch (e: any) {
			setError(e?.message || "No se pudo guardar el material.");
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
							name="description"
							label="Descripción"
							placeholder="Bajante de PVC de 3 plg"
							rules={{ required: "Requerido" }}
						/>
						<RHFInput
							name="unit"
							label="Unidad"
							placeholder="MI / PZA / Jgo / ML"
							rules={{ required: "Requerido" }}
						/>
						<RHFInput
							type="number"
							step="0.01"
							name="priceBs"
							label="Precio en Bs"
							placeholder="0.00"
						/>
						<RHFInput
							type="number"
							step="0.01"
							name="priceUsd"
							label="Precio en USD"
							placeholder="0.00"
						/>
						<RHFInput
							type="number"
							step="0.01"
							name="minStock"
							label="Stock mínimo (opcional)"
							placeholder="0"
						/>
						<RHFInput
							type="number"
							step="0.0001"
							name="tc"
							label="Tipo de cambio (opcional)"
							placeholder="6.96"
						/>
					</div>

					<div className="space-y-4">
						<RHFFileInput
							name="addFiles"
							label="Imágenes del material"
							multiple
						/>
						<p className="text-xs text-gray-500">
							Puedes seleccionar varias; se subirán al guardar.
						</p>

						{previewFiles.length > 0 && (
							<div className="rounded-lg border">
								<div className="bg-gray-50 px-3 py-2 text-sm font-medium">
									Vista previa (nuevas)
								</div>
								<div className="grid grid-cols-3 gap-2 p-3">
									{previewFiles.map((f) => (
										<div
											key={f.url}
											className="relative aspect-video overflow-hidden rounded border"
										>
											<img
												src={f.url}
												alt={f.name}
												className="h-full w-full object-cover"
											/>
										</div>
									))}
								</div>
							</div>
						)}

						{existing.length > 0 && (
							<div className="rounded-lg border">
								<div className="bg-gray-50 px-3 py-2 text-sm font-medium">
									Imágenes actuales
								</div>
								<div className="grid grid-cols-3 gap-2 p-3">
									{existing.map((img) => {
										const marked = toRemove.has(img.path);
										return (
											<div key={img.path} className="relative">
												<div
													className={`relative aspect-video overflow-hidden rounded border ${
														marked ? "opacity-50" : ""
													}`}
												>
													<img
														src={img.url}
														alt={img.name || ""}
														className="h-full w-full object-cover"
													/>
												</div>
												<label className="mt-1 flex items-center gap-2 text-xs">
													<input
														type="checkbox"
														checked={marked}
														onChange={() => toggleRemove(img.path)}
													/>
													Eliminar
												</label>
											</div>
										);
									})}
								</div>
							</div>
						)}
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
						{material ? "Guardar cambios" : "Crear material"}
					</Button>
					{error && <span className="text-sm text-red-600">{error}</span>}
					{ok && <span className="text-sm text-green-600">{ok}</span>}
				</div>
			</form>
		</FormProvider>
	);
}
