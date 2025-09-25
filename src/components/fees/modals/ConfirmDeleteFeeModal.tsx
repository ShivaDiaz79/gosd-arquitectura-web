"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import { FeesService } from "@/services/FeesService";

export default function ConfirmDeleteFeeModal({
	isOpen,
	onClose,
	feeId,
	feeName,
	onDeleted,
}: {
	isOpen: boolean;
	onClose: () => void;
	feeId: string;
	feeName?: string;
	onDeleted?: () => void;
}) {
	const [confirmText, setConfirmText] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [done, setDone] = useState(false);
	const [loading, setLoading] = useState(false);

	async function onConfirm() {
		if (confirmText !== "ELIMINAR") {
			setError('Escribe "ELIMINAR" para confirmar');
			return;
		}
		try {
			setLoading(true);
			setError(null);
			await FeesService.remove(feeId);
			setDone(true);
			onDeleted?.();
		} catch (e: any) {
			setError(e?.message ?? "No se pudo eliminar");
		} finally {
			setLoading(false);
		}
	}

	return (
		<Modal isOpen={isOpen} onClose={onClose} className="max-w-md p-6 sm:p-8">
			<h3 className="mb-2 text-lg font-semibold">Eliminar categoría</h3>
			<p className="mb-5 text-sm text-gray-500">
				Esta acción es permanente para{" "}
				<span className="font-semibold">{feeName || feeId}</span>.
			</p>

			{done ? (
				<div className="space-y-6">
					<div className="rounded-lg border border-success-500/40 bg-success-50 px-4 py-3 text-sm">
						✅ Categoría eliminada.
					</div>
					<div className="flex justify-end">
						<Button onClick={onClose}>Cerrar</Button>
					</div>
				</div>
			) : (
				<>
					{error && (
						<div className="mb-4 rounded border border-error-500/40 bg-error-50 px-4 py-3 text-sm">
							{error}
						</div>
					)}
					<div className="space-y-3">
						<label className="text-sm">Para confirmar, escribe ELIMINAR</label>
						<input
							className="w-full rounded border px-3 py-2 text-sm"
							placeholder="ELIMINAR"
							value={confirmText}
							onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
						/>
					</div>
					<div className="mt-6 flex items-center justify-end gap-2">
						<Button variant="outline" onClick={onClose}>
							Cancelar
						</Button>
						<Button
							onClick={onConfirm}
							disabled={loading}
							className="!bg-rose-600 hover:!bg-rose-500"
						>
							{loading ? "Eliminando…" : "Eliminar"}
						</Button>
					</div>
				</>
			)}
		</Modal>
	);
}
