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
import { LaborService } from "@/services/LaborService";
import type { LaborRow } from "@/lib/types/labor.type";
import { formatMoney, type Currency } from "@/lib/utils/currency";
import EditLaborModal from "./modals/EditLaborModal";
import ConfirmDeleteLaborModal from "./modals/ConfirmDeleteLaborModal";
import { Modal } from "@/components/ui/modal";
import LaborForm from "./LaborForm";

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

export default function LaborsList({
	pageSize = 10,
	className = "",
}: {
	pageSize?: number;
	className?: string;
}) {
	const [page, setPage] = useState(0);
	const [labors, setLabors] = useState<LaborRow[]>([]);
	const [cursors, setCursors] = useState<QueryDocumentSnapshot<DocumentData>[]>(
		[]
	);
	const [hasNext, setHasNext] = useState(false);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState("");

	const [currency, setCurrency] = useState<Currency>("BOB");

	const [editingId, setEditingId] = useState<string | null>(null);
	const [delItem, setDelItem] = useState<LaborRow | null>(null);
	const [openCreate, setOpenCreate] = useState(false);

	useEffect(() => {
		setLoading(true);
		const after = page > 0 ? cursors[page - 1] : undefined;

		const unsub = LaborService.listenPage({
			pageSize,
			after,
			search,
			onResult: ({ labors, lastDoc, hasNext }) => {
				setLabors(labors);
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
	}, [page, pageSize, search]);

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
				<h2 className="text-base font-semibold text-slate-900">Mano de obra</h2>

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

					<div className="flex items-center rounded-xl border border-slate-200 bg-white">
						<button
							onClick={() => setCurrency("BOB")}
							className={`px-3 py-2 text-xs ${
								currency === "BOB" ? "font-semibold" : "text-slate-500"
							}`}
						>
							Bs
						</button>
						<span className="text-slate-200">|</span>
						<button
							onClick={() => setCurrency("USD")}
							className={`px-3 py-2 text-xs ${
								currency === "USD" ? "font-semibold" : "text-slate-500"
							}`}
						>
							USD
						</button>
					</div>

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
								Unidad
							</TableCell>
							<TableCell
								isHeader
								className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500"
							>
								Tarifa ({currency})
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
										<div className="h-4 w-32 rounded bg-slate-200" />
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
										<div className="h-8 w-28 rounded bg-slate-200" />
									</TableCell>
								</TableRow>
							))
						) : labors.length === 0 ? (
							<TableRow>
								<TableCell
									className="px-4 py-6 text-sm text-slate-500"
									colSpan={6}
								>
									No hay registros.
								</TableCell>
							</TableRow>
						) : (
							labors.map((l) => {
								const rate = currency === "BOB" ? l.rateBs : l.rateUsd;
								return (
									<TableRow key={l.id} className="hover:bg-slate-50">
										<TableCell className="px-4 py-3">
											<div className="text-sm text-slate-900">{l.name}</div>
										</TableCell>
										<TableCell className="px-4 py-3">
											<div className="text-sm text-slate-700">
												{l.category || "—"}
											</div>
										</TableCell>
										<TableCell className="px-4 py-3">
											<span className="inline-flex items-center rounded-full bg-slate-50 px-2.5 py-1 text-xs ring-1 ring-slate-200">
												{l.unit}
											</span>
										</TableCell>
										<TableCell className="px-4 py-3">
											<div className="text-sm font-medium">
												{formatMoney(rate, currency)}
											</div>
										</TableCell>
										<TableCell className="px-4 py-3">
											<div className="text-sm text-slate-700">
												{formatDate(l.createdAt)}
											</div>
										</TableCell>
										<TableCell className="px-4 py-3">
											<div className="flex items-center gap-2">
												<button
													onClick={() => setEditingId(l.id)}
													className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
												>
													Editar
												</button>
												<button
													onClick={() => setDelItem(l)}
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
				<EditLaborModal
					isOpen={!!editingId}
					laborId={editingId}
					onClose={() => setEditingId(null)}
					onSaved={() => setEditingId(null)}
				/>
			)}

			{delItem && (
				<ConfirmDeleteLaborModal
					isOpen={!!delItem}
					onClose={() => setDelItem(null)}
					laborId={delItem.id}
					laborName={delItem.name}
					onDeleted={() => setDelItem(null)}
				/>
			)}

			<Modal
				isOpen={openCreate}
				onClose={() => setOpenCreate(false)}
				className="max-w-3xl p-6 sm:p-8"
			>
				<h3 className="mb-2 text-lg font-semibold">Nueva mano de obra</h3>
				<p className="mb-5 text-sm text-gray-500">Completa datos y tarifas.</p>
				<LaborForm onSaved={() => setOpenCreate(false)} />
			</Modal>
		</div>
	);
}
