"use client";

import { useEffect, useState } from "react";
import {
	Table,
	TableHeader,
	TableBody,
	TableRow,
	TableCell,
} from "@/components/ui/table";
import { QueryDocumentSnapshot, DocumentData } from "firebase/firestore";
import { ToolsService } from "@/services/ToolsService";
import type { ToolRow } from "@/lib/types/tool.type";
import EditToolModal from "./modals/EditToolModal";
import ConfirmDeleteToolModal from "./modals/ConfirmDeleteToolModal";
import MoveToolModal from "./modals/MoveToolStockModal";
import { Modal } from "@/components/ui/modal";
import ToolForm from "./ToolForm";

function formatDate(d?: Date | null) {
	if (!d) return "—";
	try {
		return d.toLocaleDateString("es-BO", {
			year: "numeric",
			month: "short",
			day: "2-digit",
		});
	} catch {
		return "—";
	}
}

export default function ToolsList({
	pageSize = 10,
	className = "",
}: {
	pageSize?: number;
	className?: string;
}) {
	const [page, setPage] = useState(0);
	const [tools, setTools] = useState<ToolRow[]>([]);
	const [cursors, setCursors] = useState<QueryDocumentSnapshot<DocumentData>[]>(
		[]
	);
	const [hasNext, setHasNext] = useState(false);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState("");

	const [editingId, setEditingId] = useState<string | null>(null);
	const [delTool, setDelTool] = useState<ToolRow | null>(null);
	const [openCreate, setOpenCreate] = useState(false);
	const [moveFor, setMoveFor] = useState<ToolRow | null>(null);

	useEffect(() => {
		setLoading(true);
		const after = page > 0 ? cursors[page - 1] : undefined;
		const unsub = ToolsService.listenPage({
			pageSize,
			after,
			search,
			onResult: ({ tools, lastDoc, hasNext }) => {
				setTools(tools);
				setHasNext(hasNext);
				if (lastDoc)
					setCursors((prev) => {
						const c = [...prev];
						c[page] = lastDoc;
						return c;
					});
				setLoading(false);
			},
			onError: () => setLoading(false),
		});
		return () => unsub();
	}, [page, pageSize, search]);

	return (
		<div
			className={`rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 dark:bg-gray-900 ${className}`}
		>
			<div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<h2 className="text-base font-semibold text-slate-900">Herramientas</h2>
				<div className="flex w-full items-center gap-2 sm:w-auto">
					<div className="relative w-full sm:w-80">
						<input
							value={search}
							onChange={(e) => {
								setPage(0);
								setCursors([]);
								setSearch(e.target.value);
							}}
							placeholder="Buscar por nombre…"
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
						Nueva
					</button>
				</div>
			</div>

			<div className="overflow-x-auto">
				<Table className="divide-y divide-slate-200">
					<TableHeader>
						<TableRow className="text-left">
							<TableCell
								isHeader
								className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500"
							>
								Nombre
							</TableCell>
							<TableCell
								isHeader
								className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500"
							>
								Código
							</TableCell>
							<TableCell
								isHeader
								className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500"
							>
								Categoría
							</TableCell>
							<TableCell
								isHeader
								className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500"
							>
								Stock
							</TableCell>
							<TableCell
								isHeader
								className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500"
							>
								Ubicación
							</TableCell>
							<TableCell
								isHeader
								className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500"
							>
								Creado
							</TableCell>
							<TableCell
								isHeader
								className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500"
							>
								Acciones
							</TableCell>
						</TableRow>
					</TableHeader>
					<TableBody className="divide-y divide-slate-100">
						{loading ? (
							Array.from({ length: 5 }).map((_, i) => (
								<TableRow key={`sk-${i}`} className="animate-pulse">
									<TableCell className="px-4 py-4">
										<div className="h-4 w-80 rounded bg-slate-200" />
									</TableCell>
									<TableCell className="px-4 py-4">
										<div className="h-4 w-24 rounded bg-slate-200" />
									</TableCell>
									<TableCell className="px-4 py-4">
										<div className="h-4 w-24 rounded bg-slate-200" />
									</TableCell>
									<TableCell className="px-4 py-4">
										<div className="h-4 w-16 rounded bg-slate-200" />
									</TableCell>
									<TableCell className="px-4 py-4">
										<div className="h-4 w-24 rounded bg-slate-200" />
									</TableCell>
									<TableCell className="px-4 py-4">
										<div className="h-4 w-24 rounded bg-slate-200" />
									</TableCell>
									<TableCell className="px-4 py-4">
										<div className="h-8 w-24 rounded bg-slate-200" />
									</TableCell>
								</TableRow>
							))
						) : tools.length === 0 ? (
							<TableRow>
								<TableCell
									className="px-4 py-6 text-sm text-slate-500"
									colSpan={7}
								>
									No hay herramientas.
								</TableCell>
							</TableRow>
						) : (
							tools.map((t) => {
								const low =
									typeof t.minStock === "number" && t.stock <= t.minStock;
								return (
									<TableRow key={t.id} className="hover:bg-slate-50">
										<TableCell className="px-4 py-3">
											<div className="text-sm text-slate-900">{t.name}</div>
										</TableCell>
										<TableCell className="px-4 py-3">
											<div className="text-sm text-slate-700">
												{t.code || "—"}
											</div>
										</TableCell>
										<TableCell className="px-4 py-3">
											<div className="text-sm text-slate-700">
												{t.category || "—"}
											</div>
										</TableCell>
										<TableCell className="px-4 py-3">
											<span
												className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs ring-1 ${
													low
														? "bg-rose-50 text-rose-700 ring-rose-200"
														: "bg-slate-50 text-slate-700 ring-slate-200"
												}`}
											>
												{t.stock}
											</span>
										</TableCell>
										<TableCell className="px-4 py-3">
											<div className="text-sm text-slate-700">
												{t.location || "—"}
											</div>
										</TableCell>
										<TableCell className="px-4 py-3">
											<div className="text-sm text-slate-700">
												{formatDate(t.createdAt)}
											</div>
										</TableCell>
										<TableCell className="px-4 py-3">
											<div className="flex items-center gap-2">
												<button
													onClick={() => setMoveFor(t)}
													className="inline-flex items-center rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
												>
													Inventario
												</button>
												<button
													onClick={() => setEditingId(t.id)}
													className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
												>
													Editar
												</button>
												<button
													onClick={() => setDelTool(t)}
													className="inline-flex items-center rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-100"
												>
													Eliminar
												</button>
											</div>
										</TableCell>
									</TableRow>
								);
							})
						)}
					</TableBody>
				</Table>
			</div>

			<div className="mt-4 flex items-center justify-between">
				<div className="text-xs text-slate-500">
					Página <span className="font-medium">{page + 1}</span>
				</div>
				<div className="flex items-center gap-2">
					<button
						onClick={() => page > 0 && setPage((p) => p - 1)}
						disabled={page === 0}
						className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs hover:bg-slate-50 disabled:opacity-50"
					>
						Anterior
					</button>
					<button
						onClick={() => hasNext && setPage((p) => p + 1)}
						disabled={!hasNext}
						className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs hover:bg-slate-50 disabled:opacity-50"
					>
						Siguiente
					</button>
				</div>
			</div>

			{editingId && (
				<EditToolModal
					isOpen={!!editingId}
					onClose={() => setEditingId(null)}
					toolId={editingId}
					onSaved={() => setEditingId(null)}
				/>
			)}
			{delTool && (
				<ConfirmDeleteToolModal
					isOpen={!!delTool}
					onClose={() => setDelTool(null)}
					toolId={delTool.id}
					toolName={delTool.name}
					onDeleted={() => setDelTool(null)}
				/>
			)}
			<Modal
				isOpen={openCreate}
				onClose={() => setOpenCreate(false)}
				className="max-w-4xl p-6 sm:p-8"
			>
				<h3 className="mb-2 text-lg font-semibold">Nueva herramienta</h3>
				<p className="mb-5 text-sm text-gray-500">
					Completa los datos e imágenes.
				</p>
				<ToolForm onSaved={() => setOpenCreate(false)} />
			</Modal>
			{moveFor && (
				<MoveToolModal
					isOpen={!!moveFor}
					onClose={() => setMoveFor(null)}
					tool={moveFor}
					onDone={() => setMoveFor(null)}
				/>
			)}
		</div>
	);
}
