"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import { FeesService } from "@/services/FeesService";
import type { FeeRow } from "@/lib/types/fee.type";
import FeeForm from "../FeeForm";

export default function EditFeeModal({
	isOpen,
	onClose,
	feeId,
	onSaved,
}: {
	isOpen: boolean;
	onClose: () => void;
	feeId: string;
	onSaved?: () => void;
}) {
	const [loading, setLoading] = useState(true);
	const [fee, setFee] = useState<FeeRow | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let active = true;
		async function load() {
			setError(null);
			setLoading(true);
			try {
				const f = await FeesService.getById(feeId);
				if (!active) return;
				setFee(f);
			} catch (e: any) {
				if (!active) return;
				setError(e?.message || "No se pudo cargar.");
			} finally {
				if (active) setLoading(false);
			}
		}
		if (isOpen && feeId) load();
		return () => {
			active = false;
		};
	}, [isOpen, feeId]);

	return (
		<Modal isOpen={isOpen} onClose={onClose} className="max-w-4xl p-6 sm:p-8">
			<h3 className="mb-2 text-lg font-semibold">Editar categoría</h3>
			<p className="mb-5 text-sm text-gray-500">Actualiza nombre y rangos.</p>

			{error && (
				<div className="mb-4 rounded border border-error-500/40 bg-error-50 px-4 py-3 text-sm">
					{error}
				</div>
			)}

			{loading ? (
				<div className="space-y-3">
					<div className="h-5 w-40 animate-pulse rounded bg-slate-200" />
					<div className="h-10 w-full animate-pulse rounded bg-slate-200" />
					<div className="h-52 w-full animate-pulse rounded bg-slate-200" />
				</div>
			) : !fee ? (
				<div className="text-sm text-slate-600">Categoría no encontrada.</div>
			) : (
				<FeeForm fee={fee} onSaved={() => onSaved?.()} />
			)}

			<div className="mt-6 flex items-center justify-end">
				<Button variant="outline" onClick={onClose}>
					Cerrar
				</Button>
			</div>
		</Modal>
	);
}
