"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import LaborForm from "../LaborForm";
import { LaborService } from "@/services/LaborService";
import type { LaborRow } from "@/lib/types/labor.type";

export default function EditLaborModal({
	isOpen,
	onClose,
	laborId,
	onSaved,
	showCloseButton = true,
	isFullscreen = false,
}: {
	isOpen: boolean;
	onClose: () => void;
	laborId: string;
	onSaved?: () => void;
	showCloseButton?: boolean;
	isFullscreen?: boolean;
}) {
	const [loading, setLoading] = useState(true);
	const [labor, setLabor] = useState<LaborRow | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let active = true;
		async function load() {
			setError(null);
			setLoading(true);
			try {
				const it = await LaborService.getById(laborId);
				if (!active) return;
				setLabor(it);
			} catch (e: any) {
				if (!active) return;
				setError(e?.message || "No se pudo cargar.");
			} finally {
				if (active) setLoading(false);
			}
		}
		if (isOpen && laborId) load();
		return () => {
			active = false;
		};
	}, [isOpen, laborId]);

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			className="max-w-3xl p-6 sm:p-8"
			showCloseButton={showCloseButton}
			isFullscreen={isFullscreen}
		>
			<h3 className="mb-2 text-lg font-semibold">Editar mano de obra</h3>
			<p className="mb-5 text-sm text-gray-500">Actualiza datos y tarifas.</p>

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
			) : !labor ? (
				<div className="text-sm text-slate-600">Registro no encontrado.</div>
			) : (
				<LaborForm
					labor={labor}
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
