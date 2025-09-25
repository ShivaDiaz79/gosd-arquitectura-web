"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import { PlansService } from "@/services/PlansService";
import type { PlanRow } from "@/lib/types/plan.type";
import PlanForm from "../PlanForm";

export default function EditPlanModal({
	isOpen,
	onClose,
	planId,
	onSaved,
}: {
	isOpen: boolean;
	onClose: () => void;
	planId: string;
	onSaved?: () => void;
}) {
	const [loading, setLoading] = useState(true);
	const [plan, setPlan] = useState<PlanRow | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let active = true;
		async function load() {
			setError(null);
			setLoading(true);
			try {
				const p = await PlansService.getById(planId);
				if (!active) return;
				setPlan(p);
			} catch (e: any) {
				if (!active) return;
				setError(e?.message || "No se pudo cargar.");
			} finally {
				if (active) setLoading(false);
			}
		}
		if (isOpen && planId) load();
		return () => {
			active = false;
		};
	}, [isOpen, planId]);

	return (
		<Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl p-6 sm:p-8">
			<h3 className="mb-2 text-lg font-semibold">Editar plan</h3>
			<p className="mb-5 text-sm text-gray-500">
				Actualiza el nombre y el precio.
			</p>

			{error && (
				<div className="mb-4 rounded border border-error-500/40 bg-error-50 px-4 py-3 text-sm">
					{error}
				</div>
			)}
			{loading ? (
				<div className="h-10 w-full animate-pulse rounded bg-slate-200" />
			) : !plan ? (
				<div className="text-sm text-slate-600">Plan no encontrado.</div>
			) : (
				<PlanForm plan={plan} onSaved={() => onSaved?.()} />
			)}

			<div className="mt-6 flex items-center justify-end">
				<Button variant="outline" onClick={onClose}>
					Cerrar
				</Button>
			</div>
		</Modal>
	);
}
