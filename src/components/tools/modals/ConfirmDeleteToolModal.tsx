"use client";
import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import { ToolsService } from "@/services/ToolsService";

export default function ConfirmDeleteToolModal({
	isOpen,
	onClose,
	toolId,
	toolName,
	onDeleted,
}: {
	isOpen: boolean;
	onClose: () => void;
	toolId: string;
	toolName?: string;
	onDeleted?: () => void;
}) {
	const [txt, setTxt] = useState("");
	const [err, setErr] = useState<string | null>(null);
	const [done, setDone] = useState(false);
	const [loading, setLoading] = useState(false);

	async function confirm() {
		if (txt !== "ELIMINAR") {
			setErr('Escribe "ELIMINAR" para confirmar');
			return;
		}
		try {
			setLoading(true);
			setErr(null);
			await ToolsService.remove(toolId);
			setDone(true);
			onDeleted?.();
		} catch (e: any) {
			setErr(e?.message ?? "No se pudo eliminar");
		} finally {
			setLoading(false);
		}
	}

	return (
		<Modal isOpen={isOpen} onClose={onClose} className="max-w-md p-6 sm:p-8">
			<h3 className="mb-2 text-lg font-semibold">Eliminar herramienta</h3>
			<p className="mb-5 text-sm text-gray-500">
				Esta acción es permanente para <b>{toolName || toolId}</b>.
			</p>
			{done ? (
				<div className="space-y-6">
					<div className="rounded border border-success-500/40 bg-success-50 px-4 py-3 text-sm">
						✅ Eliminada.
					</div>
					<div className="flex justify-end">
						<Button onClick={onClose}>Cerrar</Button>
					</div>
				</div>
			) : (
				<>
					{err && (
						<div className="mb-4 rounded border border-error-500/40 bg-error-50 px-4 py-3 text-sm">
							{err}
						</div>
					)}
					<div className="space-y-3">
						<Label htmlFor="confirm">Para confirmar, escribe ELIMINAR</Label>
						<Input
							id="confirm"
							placeholder="ELIMINAR"
							value={txt}
							onChange={(e) => setTxt(e.target.value.toUpperCase())}
							error={!!err && txt !== "ELIMINAR"}
						/>
					</div>
					<div className="mt-6 flex items-center justify-end gap-2">
						<Button variant="outline" onClick={onClose}>
							Cancelar
						</Button>
						<Button
							onClick={confirm}
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
