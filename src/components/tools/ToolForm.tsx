"use client";

import { useEffect, useMemo, useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import RHFInput from "@/components/form/RHFInput";
import RHFFileInput from "@/components/form/RHFFileInput";
import Button from "@/components/ui/button/Button";
import type { ToolRow, ToolImage } from "@/lib/types/tool.type";
import { ToolsService } from "@/services/ToolsService";

type FormValues = {
	name: string;
	code?: string;
	category?: string;
	unit: string;
	minStock: number | string | null;
	location?: string;
	addFiles: FileList | null;
};

export default function ToolForm({
	tool,
	onSaved,
}: {
	tool?: ToolRow | null;
	onSaved?: (id: string) => void;
}) {
	const methods = useForm<FormValues>({
		defaultValues: {
			name: tool?.name ?? "",
			code: tool?.code ?? "",
			category: tool?.category ?? "",
			unit: tool?.unit ?? "und",
			minStock: tool?.minStock ?? "",
			location: tool?.location ?? "",
			addFiles: null,
		},
	});

	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [ok, setOk] = useState<string | null>(null);
	const [existing, setExisting] = useState<ToolImage[]>(tool?.images ?? []);
	const [toRemove, setToRemove] = useState<Set<string>>(new Set());

	useEffect(() => {
		methods.reset({
			name: tool?.name ?? "",
			code: tool?.code ?? "",
			category: tool?.category ?? "",
			unit: tool?.unit ?? "und",
			minStock: tool?.minStock ?? "",
			location: tool?.location ?? "",
			addFiles: null,
		});
		setExisting(tool?.images ?? []);
		setToRemove(new Set());
		setError(null);
		setOk(null);
	}, [tool?.id, methods]);

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

	const onSubmit = methods.handleSubmit(async (v) => {
		setSaving(true);
		setError(null);
		setOk(null);
		try {
			if (tool) {
				await ToolsService.update(tool.id, {
					name: v.name,
					code: v.code,
					category: v.category,
					unit: v.unit,
					minStock: v.minStock === "" ? null : Number(v.minStock),
					location: v.location,
					addFiles: v.addFiles ? Array.from(v.addFiles) : [],
					removePaths: Array.from(toRemove),
				});
				setOk("Herramienta actualizada.");
				onSaved?.(tool.id);
			} else {
				const res = await ToolsService.create({
					name: v.name,
					code: v.code,
					category: v.category,
					unit: v.unit,
					minStock: v.minStock === "" ? undefined : Number(v.minStock),
					location: v.location,
					files: v.addFiles ? Array.from(v.addFiles) : [],
				});
				setOk("Herramienta creada.");
				methods.reset({
					name: "",
					code: "",
					category: "",
					unit: "und",
					minStock: "",
					location: "",
					addFiles: null,
				});
				setExisting([]);
				setToRemove(new Set());
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
							label="Nombre"
							placeholder="Taladro percutor"
							rules={{ required: "Requerido" }}
						/>
						<RHFInput name="code" label="Código" placeholder="H-001" />
						<RHFInput
							name="category"
							label="Categoría"
							placeholder="Eléctricas"
						/>
						<RHFInput
							name="unit"
							label="Unidad"
							placeholder="und"
							rules={{ required: "Requerido" }}
						/>
						<RHFInput
							type="number"
							step="0.01"
							name="minStock"
							label="Stock mínimo (opcional)"
							placeholder="0"
						/>
						<RHFInput
							name="location"
							label="Ubicación"
							placeholder="Almacén central"
						/>
					</div>

					<div className="space-y-4">
						<RHFFileInput name="addFiles" label="Imágenes" multiple />
						{previewFiles.length > 0 && (
							<div className="rounded-lg border">
								<div className="bg-gray-50 px-3 py-2 text-sm font-medium">
									Vista previa
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
											<div key={img.path}>
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
						{tool ? "Guardar cambios" : "Crear herramienta"}
					</Button>
					{error && <span className="text-sm text-red-600">{error}</span>}
					{ok && <span className="text-sm text-green-600">{ok}</span>}
				</div>
			</form>
		</FormProvider>
	);
}
