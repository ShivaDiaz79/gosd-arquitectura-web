"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import ProjectForm from "../ProjectForm";
import { ProjectsService } from "@/services/ProjectsService";
import type { ProjectRow } from "@/lib/types/project.type";

export default function EditProjectModal({
	isOpen,
	onClose,
	projectId,
	onSaved,
	showCloseButton = true,
	isFullscreen = false,
}: {
	isOpen: boolean;
	onClose: () => void;
	projectId: string;
	onSaved?: () => void;
	showCloseButton?: boolean;
	isFullscreen?: boolean;
}) {
	const [loading, setLoading] = useState(true);
	const [project, setProject] = useState<ProjectRow | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let active = true;
		async function load() {
			setError(null);
			setLoading(true);
			try {
				const p = await ProjectsService.getById(projectId);
				if (!active) return;
				setProject(p);
			} catch (e: any) {
				if (!active) return;
				setError(e?.message || "No se pudo cargar el proyecto.");
			} finally {
				if (active) setLoading(false);
			}
		}
		if (isOpen && projectId) load();
		return () => {
			active = false;
		};
	}, [isOpen, projectId]);

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			className="max-w-4xl p-6 sm:p-8"
			showCloseButton={showCloseButton}
			isFullscreen={isFullscreen}
		>
			<h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white/90">
				Editar proyecto
			</h3>
			<p className="mb-5 text-sm text-gray-500 dark:text-gray-400">
				Actualiza el título, la descripción y las imágenes.
			</p>

			{error && (
				<div className="mb-4 rounded-lg border border-error-500/40 bg-error-50 px-4 py-3 text-sm text-error-700 dark:border-error-500/30 dark:bg-error-500/15 dark:text-error-400">
					{error}
				</div>
			)}

			{loading ? (
				<div className="space-y-3">
					<div className="h-5 w-40 animate-pulse rounded bg-slate-200" />
					<div className="h-10 w-full animate-pulse rounded bg-slate-200" />
					<div className="h-52 w-full animate-pulse rounded bg-slate-200" />
				</div>
			) : !project ? (
				<div className="text-sm text-slate-600">Proyecto no encontrado.</div>
			) : (
				<ProjectForm
					project={project}
					onSaved={() => {
						onSaved?.();
					}}
				/>
			)}

			<div className="mt-6 flex items-center justify-end">
				<Button variant="outline" onClick={onClose}>
					Cerrar
				</Button>
			</div>
		</Modal>
	);
}
