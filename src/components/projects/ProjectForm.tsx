"use client";

import { useEffect, useMemo, useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import RHFInput from "@/components/form/RHFInput";
import RHFFileInput from "@/components/form/RHFFileInput";
import Button from "@/components/ui/button/Button";
import { ProjectsService } from "@/services/ProjectsService";
import type { ProjectRow, ProjectImage } from "@/lib/types/project.type";

type FormValues = {
	title: string;
	description: string;
	addFiles: File[] | null;
};

export default function ProjectForm({
	project,
	onSaved,
}: {
	project?: ProjectRow | null;
	onSaved?: (id: string) => void;
}) {
	const methods = useForm<FormValues>({
		defaultValues: {
			title: project?.title ?? "",
			description: project?.description ?? "",
			addFiles: null,
		},
	});

	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [ok, setOk] = useState<string | null>(null);
	const [existing, setExisting] = useState<ProjectImage[]>(
		project?.images ?? []
	);
	const [toRemove, setToRemove] = useState<Set<string>>(new Set());

	useEffect(() => {
		methods.reset({
			title: project?.title ?? "",
			description: project?.description ?? "",
			addFiles: null,
		});
		setExisting(project?.images ?? []);
		setToRemove(new Set());
		setOk(null);
		setError(null);
	}, [project, methods]);

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

	const onSubmit = methods.handleSubmit(async (vals) => {
		setSaving(true);
		setError(null);
		setOk(null);
		try {
			if (project) {
				await ProjectsService.update(project.id, {
					title: vals.title,
					description: vals.description,
					addFiles: vals.addFiles ? Array.from(vals.addFiles) : [],
					removePaths: Array.from(toRemove),
				});
				setOk("Proyecto actualizado.");
				onSaved?.(project.id);
			} else {
				const res = await ProjectsService.create({
					title: vals.title,
					description: vals.description,
					files: vals.addFiles ? Array.from(vals.addFiles) : [],
				});
				setOk("Proyecto creado.");
				methods.reset({ title: "", description: "", addFiles: null });
				setExisting([]);
				setToRemove(new Set());
				onSaved?.(res.id);
			}
		} catch (e: any) {
			setError(e?.message || "No se pudo guardar el proyecto.");
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
							name="title"
							label="Título del proyecto"
							placeholder="Ej. Torre Central"
						/>

						<div className="space-y-1.5">
							<label className="text-sm font-medium text-slate-700 dark:text-white/80">
								Descripción
							</label>
							<textarea
								className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none ring-indigo-500 focus:ring-2 dark:bg-gray-900"
								rows={6}
								placeholder="Breve descripción del proyecto…"
								{...methods.register("description", { required: "Requerido" })}
							/>
							{methods.formState.errors.description && (
								<p className="text-xs text-error-500">
									{methods.formState.errors.description.message as string}
								</p>
							)}
						</div>
					</div>

					<div className="space-y-4">
						<RHFFileInput name="addFiles" label="Imágenes" multiple />

						<p className="text-xs text-gray-500">
							Puedes seleccionar varias imágenes. Se subirán al guardar.
						</p>

						{previewFiles.length > 0 && (
							<div className="rounded-lg border border-gray-200 dark:border-white/10">
								<div className="bg-gray-50 dark:bg-white/5 px-3 py-2 text-sm font-medium">
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
							<div className="rounded-lg border border-gray-200 dark:border-white/10">
								<div className="bg-gray-50 dark:bg-white/5 px-3 py-2 text-sm font-medium">
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
						{project ? "Guardar cambios" : "Crear proyecto"}
					</Button>
					{error && <span className="text-sm text-red-600">{error}</span>}
					{ok && <span className="text-sm text-green-600">{ok}</span>}
				</div>
			</form>
		</FormProvider>
	);
}
