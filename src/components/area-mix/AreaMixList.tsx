// src/components/area-mix/AreaMixList.tsx
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
import { AreaMixService } from "@/services/AreaMixService";
import type { AreaMixRow } from "@/lib/types/area-mix.type";
import { Modal } from "@/components/ui/modal";
import AreaMixForm from "./AreaMixForm";
import EditAreaMixModal from "./modals/EditAreaMixModal";
import ConfirmDeleteAreaMixModal from "./modals/ConfirmDeleteAreaMixModal";
import { FeesService } from "@/services/FeesService";
import type { FeeRow } from "@/lib/types/fee.type";

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

export default function AreaMixList({
	pageSize = 10,
	className = "",
}: {
	pageSize?: number;
	className?: string;
}) {
	const [page, setPage] = useState(0);
	const [items, setItems] = useState<AreaMixRow[]>([]);
	const [cursors, setCursors] = useState<QueryDocumentSnapshot<DocumentData>[]>(
		[]
	);
	const [hasNext, setHasNext] = useState(false);
	const [loading, setLoading] = useState(true);

	const [search, setSearch] = useState("");
	const [categoryId, setCategoryId] = useState("");
	const [feeId, setFeeId] = useState("");

	const [fees, setFees] = useState<FeeRow[]>([]);
	useEffect(() => {
		FeesService.listAll()
			.then(setFees)
			.catch(() => setFees([]));
	}, []);

	const [editingId, setEditingId] = useState<string | null>(null);
	const [delItem, setDelItem] = useState<AreaMixRow | null>(null);
	const [openCreate, setOpenCreate] = useState(false);

	useEffect(() => {
		setLoading(true);
		const after = page > 0 ? cursors[page - 1] : undefined;

		const unsub = AreaMixService.listenPage({
			pageSize,
			after,
			search,
			categoryId: categoryId || undefined,
			feeId: feeId || undefined,
			onResult: ({ mixes, lastDoc, hasNext }) => {
				setItems(mixes);
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
	}, [page, pageSize, search, categoryId, feeId]);

	function nextPage() {
		if (hasNext) setPage((p) => p + 1);
	}
	function prevPage() {
		if (page > 0) setPage((p) => p - 1);
	}

	return (
		<div
			className={`rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 dark:bg-gray-900 ${className}`}
		>
			<div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<h2 className="text-base font-semibold text-slate-900">
					Perfiles de mezcla de áreas
				</h2>

				<div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
					<div className="relative grow sm:grow-0 sm:w-64">
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

					<input
						value={categoryId}
						onChange={(e) => {
							setPage(0);
							setCursors([]);
							setCategoryId(e.target.value);
						}}
						placeholder="Filtrar por categoría (opcional)"
						className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-indigo-500 focus:ring-2"
					/>

					<select
						value={feeId}
						onChange={(e) => {
							setPage(0);
							setCursors([]);
							setFeeId(e.target.value);
						}}
						className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-indigo-500 focus:ring-2"
					>
						<option value="">Todas las tarifas</option>
						{fees.map((f) => (
							<option key={f.id} value={f.id}>
								{f.name}
							</option>
						))}
					</select>

					<button
						onClick={() => setOpenCreate(true)}
						className="whitespace-nowrap rounded-md bg-black px-4 py-2 text-sm text-white hover:opacity-90"
					>
						Nuevo
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
								Categoría
							</TableCell>
							<TableCell
								isHeader
								className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500"
							>
								Tarifa vinculada
							</TableCell>
							<TableCell
								isHeader
								className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500"
							>
								% (resumen)
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
										<div className="h-4 w-64 rounded bg-slate-200" />
									</TableCell>
									<TableCell className="px-4 py-4">
										<div className="h-4 w-28 rounded bg-slate-200" />
									</TableCell>
									<TableCell className="px-4 py-4">
										<div className="h-4 w-40 rounded bg-slate-200" />
									</TableCell>
									<TableCell className="px-4 py-4">
										<div className="h-4 w-48 rounded bg-slate-200" />
									</TableCell>
									<TableCell className="px-4 py-4">
										<div className="h-4 w-24 rounded bg-slate-200" />
									</TableCell>
									<TableCell className="px-4 py-4">
										<div className="h-8 w-28 rounded bg-slate-200" />
									</TableCell>
								</TableRow>
							))
						) : items.length === 0 ? (
							<TableRow>
								<TableCell
									className="px-4 py-6 text-sm text-slate-500"
									colSpan={6}
								>
									No hay perfiles.
								</TableCell>
							</TableRow>
						) : (
							items.map((r) => {
								const summary = Object.entries(r.shares)
									.slice(0, 4)
									.map(([k, v]) => `${k}: ${(v * 100).toFixed(1)}%`)
									.join(" · ");
								return (
									<TableRow key={r.id} className="hover:bg-slate-50">
										<TableCell className="px-4 py-3">
											<div className="text-sm font-medium text-slate-900">
												{r.name}
											</div>
										</TableCell>
										<TableCell className="px-4 py-3">
											<div className="text-sm text-slate-700">
												{r.categoryId || "—"}
											</div>
										</TableCell>
										<TableCell className="px-4 py-3">
											<div className="text-sm text-slate-700">
												{r.feeName || "—"}
											</div>
										</TableCell>
										<TableCell className="px-4 py-3">
											<div className="text-xs text-slate-600">{summary}</div>
										</TableCell>
										<TableCell className="px-4 py-3">
											<div className="text-sm text-slate-700">
												{formatDate(r.createdAt)}
											</div>
										</TableCell>
										<TableCell className="px-4 py-3">
											<div className="flex items-center gap-2">
												<button
													onClick={() => setEditingId(r.id)}
													className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
												>
													Editar
												</button>
												<button
													onClick={() => setDelItem(r)}
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
						onClick={prevPage}
						disabled={page === 0}
						className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs hover:bg-slate-50 disabled:opacity-50"
					>
						Anterior
					</button>
					<button
						onClick={nextPage}
						disabled={!hasNext}
						className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs hover:bg-slate-50 disabled:opacity-50"
					>
						Siguiente
					</button>
				</div>
			</div>

			{editingId && (
				<EditAreaMixModal
					isOpen={!!editingId}
					mixId={editingId}
					onClose={() => setEditingId(null)}
					onSaved={() => setEditingId(null)}
				/>
			)}

			{delItem && (
				<ConfirmDeleteAreaMixModal
					isOpen={!!delItem}
					onClose={() => setDelItem(null)}
					mixId={delItem.id}
					mixName={delItem.name}
					onDeleted={() => setDelItem(null)}
				/>
			)}

			<Modal
				isOpen={openCreate}
				onClose={() => setOpenCreate(false)}
				className="max-w-3xl p-6 sm:p-8"
			>
				<h3 className="mb-2 text-lg font-semibold">Nuevo perfil de mezcla</h3>
				<p className="mb-5 text-sm text-gray-500">
					Define porcentajes que sumen 100%.
				</p>
				<AreaMixForm onSaved={() => setOpenCreate(false)} />
			</Modal>
		</div>
	);
}
