"use client";

import { useEffect, useMemo, useState } from "react";
import { QueryDocumentSnapshot, DocumentData } from "firebase/firestore";
import { PlansService } from "@/services/PlansService";
import type { PlanRow } from "@/lib/types/plan.type";
import {
	Table,
	TableHeader,
	TableBody,
	TableRow,
	TableCell,
} from "@/components/ui/table";
import { Modal } from "@/components/ui/modal";
import PlanForm from "./PlanForm";
import EditPlanModal from "./modals/EditPlanModal";
import ConfirmDeletePlanModal from "./modals/ConfirmDeletePlanModal";

function formatDate(d?: Date | null) {
	if (!d) return "—";
	try {
		return d.toLocaleDateString("es-ES", {
			year: "numeric",
			month: "short",
			day: "2-digit",
		});
	} catch {
		return "—";
	}
}

export default function PlansList({
	pageSize = 10,
	className = "",
}: {
	pageSize?: number;
	className?: string;
}) {
	const [page, setPage] = useState(0);
	const [plans, setPlans] = useState<PlanRow[]>([]);
	const [cursors, setCursors] = useState<QueryDocumentSnapshot<DocumentData>[]>(
		[]
	);
	const [hasNext, setHasNext] = useState(false);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState("");

	const [editingId, setEditingId] = useState<string | null>(null);
	const [delPlan, setDelPlan] = useState<PlanRow | null>(null);
	const [openCreate, setOpenCreate] = useState(false);

	useEffect(() => {
		setLoading(true);
		const after = page > 0 ? cursors[page - 1] : undefined;
		const unsub = PlansService.listenPage({
			pageSize,
			after,
			onResult: ({ plans, lastDoc, hasNext }) => {
				setPlans(plans);
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
	}, [page, pageSize]);

	const filtered = useMemo(() => {
		const q = search.trim().toLowerCase();
		if (!q) return plans;
		return plans.filter((p) =>
			[p.name, p.note ?? ""].join(" ").toLowerCase().includes(q)
		);
	}, [plans, search]);

	return (
		<div
			className={`rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 dark:bg-gray-900 ${className}`}
		>
			<div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<h2 className="text-base font-semibold text-slate-900">Planes</h2>
				<div className="flex w-full items-center gap-2 sm:w-auto">
					<div className="relative w-full sm:w-72">
						<input
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							placeholder="Buscar por nombre o nota…"
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

			<div className="overflow-x-auto">
				<Table className="divide-y divide-slate-200">
					<TableHeader>
						<TableRow>
							<TableCell
								isHeader
								className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500"
							>
								Plan
							</TableCell>
							<TableCell
								isHeader
								className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500"
							>
								Precio ($/m²)
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
										<div className="h-4 w-48 rounded bg-slate-200" />
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
						) : filtered.length === 0 ? (
							<TableRow>
								<TableCell
									className="px-4 py-6 text-sm text-slate-500"
									colSpan={4}
								>
									No hay planes.
								</TableCell>
							</TableRow>
						) : (
							filtered.map((p) => (
								<TableRow key={p.id} className="hover:bg-slate-50">
									<TableCell className="px-4 py-3">
										<div className="text-sm font-medium text-slate-900">
											{p.name}
										</div>
										{p.note && (
											<div className="text-xs text-slate-500">{p.note}</div>
										)}
									</TableCell>
									<TableCell className="px-4 py-3">
										<span className="text-sm">${p.price.toFixed(2)}/m²</span>
									</TableCell>
									<TableCell className="px-4 py-3">
										<div className="text-sm text-slate-700">
											{formatDate(p.createdAt)}
										</div>
									</TableCell>
									<TableCell className="px-4 py-3">
										<div className="flex items-center gap-2">
											<button
												onClick={() => setEditingId(p.id)}
												className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
											>
												Editar
											</button>
											<button
												onClick={() => setDelPlan(p)}
												className="inline-flex items-center rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-100"
											>
												Eliminar
											</button>
										</div>
									</TableCell>
								</TableRow>
							))
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
						onClick={() => setPage((p) => Math.max(0, p - 1))}
						disabled={page === 0}
						className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs"
					>
						Anterior
					</button>
					<button
						onClick={() => hasNext && setPage((p) => p + 1)}
						disabled={!hasNext}
						className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs"
					>
						Siguiente
					</button>
				</div>
			</div>

			{editingId && (
				<EditPlanModal
					isOpen={!!editingId}
					onClose={() => setEditingId(null)}
					planId={editingId}
					onSaved={() => setEditingId(null)}
				/>
			)}

			{delPlan && (
				<ConfirmDeletePlanModal
					isOpen={!!delPlan}
					onClose={() => setDelPlan(null)}
					planId={delPlan.id}
					planName={delPlan.name}
					onDeleted={() => setDelPlan(null)}
				/>
			)}

			<Modal
				isOpen={openCreate}
				onClose={() => setOpenCreate(false)}
				className="max-w-2xl p-6 sm:p-8"
			>
				<h3 className="mb-2 text-lg font-semibold">Nuevo plan</h3>
				<p className="mb-5 text-sm text-gray-500">Nombre y precio por m².</p>
				<PlanForm onSaved={() => setOpenCreate(false)} />
			</Modal>
		</div>
	);
}
