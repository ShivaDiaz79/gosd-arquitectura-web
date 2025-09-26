"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import { LaborService } from "@/services/LaborService";

export default function ConfirmDeleteLaborModal({
	isOpen,
	onClose,
	laborId,
	laborName,
	onDeleted,
}: {
	isOpen: boolean;
	onClose: () => void;
	laborId: string;
	laborName?: string;
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
			await LaborService.remove(laborId);
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
			<h3 className="mb-2 text-lg font-semibold">Eliminar mano de obra</h3>
			<p className="mb-5 text-sm text-gray-500">
				Esta acción es permanente para{" "}
				<span className="font-semibold">{laborName || laborId}</span>.
			</p>

			{done ? (
				<div className="space-y-6">
					<div className="rounded border border-success-500/40 bg-success-50 px-4 py-3 text-sm">
						✅ Registro eliminado.
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
						<Label htmlFor="confirm">Para confirmar, escribe ELIMINAR</Label>
						<Input
							id="confirm"
							placeholder="ELIMINAR"
							value={confirmText}
							onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
							error={!!error && confirmText !== "ELIMINAR"}
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
							{loading && (
								<svg
									className="mr-2 h-4 w-4 animate-spin"
									viewBox="0 0 24 24"
									fill="none"
								>
									<circle
										className="opacity-25"
										cx="12"
										cy="12"
										r="10"
										stroke="currentColor"
										strokeWidth="4"
									/>
									<path
										className="opacity-75"
										fill="currentColor"
										d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
									/>
								</svg>
							)}
							Eliminar
						</Button>
					</div>
				</>
			)}
		</Modal>
	);
}
