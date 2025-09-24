// src/components/projects/ProjectsList.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import {
	Table,
	TableHeader,
	TableBody,
	TableRow,
	TableCell,
} from "@/components/ui/table";
import { QueryDocumentSnapshot, DocumentData } from "firebase/firestore";
import { ProjectsService } from "@/services/ProjectsService";
import type { ProjectRow } from "@/lib/types/project.type";
import EditProjectModal from "./modals/EditProjectModal";
import ConfirmDeleteProjectModal from "./modals/ConfirmDeleteProjectModal";
import { Modal } from "@/components/ui/modal";
import ProjectForm from "@/components/projects/ProjectForm"; // <— asegúrate del path correcto

export default function ProjectsList({ pageSize = 10 }: { pageSize?: number }) {
	const [page, setPage] = useState(0);
	const [projects, setProjects] = useState<ProjectRow[]>([]);
	const [cursors, setCursors] = useState<QueryDocumentSnapshot<DocumentData>[]>(
		[]
	);
	const [hasNext, setHasNext] = useState(false);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState("");

	const [editingId, setEditingId] = useState<string | null>(null);
	const [delProject, setDelProject] = useState<ProjectRow | null>(null);

	// NUEVO: modal crear
	const [openCreate, setOpenCreate] = useState(false);

	useEffect(() => {
		setLoading(true);
		const after = page > 0 ? cursors[page - 1] : undefined;
		const unsub = ProjectsService.listenPage({
			pageSize,
			after,
			onResult: ({ projects, lastDoc, hasNext }) => {
				setProjects(projects);
				setHasNext(hasNext);
				if (lastDoc) {
					setCursors((prev) => {
						const copy = [...prev];
						copy[page] = lastDoc;
						return copy;
					});
				}
				setLoading(false);
			},
			onError: () => setLoading(false),
		});
		return () => unsub();
	}, [page, pageSize]);

	const filtered = useMemo(() => {
		const q = search.trim().toLowerCase();
		if (!q) return projects;
		return projects.filter((p) =>
			[p.title, p.description].join(" ").toLowerCase().includes(q)
		);
	}, [projects, search]);

	return (
		<div className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 dark:bg-gray-900">
			<div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<h2 className="text-base font-semibold text-slate-900">Proyectos</h2>

				<div className="flex w-full items-center gap-2 sm:w-auto">
					<div className="relative w-full sm:w-72">
						<input
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							placeholder="Buscar por título o descripción…"
							className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-3 py-2 text-sm outline-none ring-indigo-500 focus:ring-2"
						/>
						<svg
							className="pointer-events-none absolute left-3 top-2.5 h-5 w-5 text-slate-400"
							viewBox="0 0 24 24"
							fill="currentColor"
						>
							<path d="M10 4a6 6 0 104.47 10.03l4.4 4.4a1 1 0 001.42-1.42l-4.4-4.4A6 6 0 0010 4zm0 2a4 4 0 110 8 4 4 0 010-8z" />
						</svg>
					</div>

					<button
						onClick={() => setOpenCreate(true)}
						className="whitespace-nowrap rounded-md bg-black px-4 py-2 text-sm text-white hover:opacity-90"
					>
						Nuevo
					</button>
				</div>
			</div>

			<div className="overflow-x-auto"></div>

			<div className="mt-4 flex items-center justify-between">
				<div className="text-xs text-slate-500">
					Página <span className="font-medium">{page + 1}</span>
				</div>
				<div className="flex items-center gap-2">
					<button
						onClick={() => setPage((p) => Math.max(0, p - 1))}
						disabled={page === 0}
						className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
					>
						Anterior
					</button>
					<button
						onClick={() => hasNext && setPage((p) => p + 1)}
						disabled={!hasNext}
						className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
					>
						Siguiente
					</button>
				</div>
			</div>

			{editingId && (
				<EditProjectModal
					isOpen={!!editingId}
					projectId={editingId}
					onClose={() => setEditingId(null)}
					onSaved={() => setEditingId(null)}
				/>
			)}

			{delProject && (
				<ConfirmDeleteProjectModal
					isOpen={!!delProject}
					onClose={() => setDelProject(null)}
					projectId={delProject.id}
					projectTitle={delProject.title}
					onDeleted={() => setDelProject(null)}
				/>
			)}

			<Modal
				isOpen={openCreate}
				onClose={() => setOpenCreate(false)}
				className="max-w-4xl p-6 sm:p-8"
			>
				<h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white/90">
					Nuevo proyecto
				</h3>
				<p className="mb-5 text-sm text-gray-500 dark:text-gray-400">
					Carga el título, la descripción y las imágenes.
				</p>
				<ProjectForm onSaved={() => setOpenCreate(false)} />
			</Modal>
		</div>
	);
}
