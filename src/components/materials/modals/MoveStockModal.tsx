"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import type { MaterialRow } from "@/lib/types/material.type";
import { MaterialsService } from "@/services/MaterialsService";

export default function MoveStockModal({
	isOpen,
	onClose,
	material,
	onDone,
}: {
	isOpen: boolean;
	onClose: () => void;
	material: MaterialRow;
	onDone?: () => void;
}) {
	const [type, setType] = useState<"in" | "out" | "adjust">("in");
	const [qty, setQty] = useState<number>(0);
	const [note, setNote] = useState("");
	const [loading, setLoading] = useState(false);
	const [err, setErr] = useState<string | null>(null);

	async function submit() {
		try {
			setLoading(true);
			setErr(null);
			await MaterialsService.moveStock(material.id, {
				type,
				qty: Number(qty),
				note,
			});
			onDone?.();
			onClose();
		} catch (e: any) {
			setErr(e?.message || "No se pudo registrar el movimiento.");
		} finally {
			setLoading(false);
		}
	}

	return (
		<Modal isOpen={isOpen} onClose={onClose} className="max-w-md p-6 sm:p-8">
			<h3 className="mb-2 text-lg font-semibold">
				Inventario: {material.description}
			</h3>
			<p className="mb-4 text-sm text-slate-600">
				Stock actual: <b>{material.stock}</b> {material.unit}
			</p>
			{err && (
				<div className="mb-3 rounded border border-error-500/40 bg-error-50 px-3 py-2 text-sm">
					{err}
				</div>
			)}

			<div className="space-y-3">
				<div className="flex gap-2">
					<button
						className={`rounded-md border px-3 py-1.5 text-xs ${
							type === "in"
								? "border-emerald-300 bg-emerald-50"
								: "border-slate-200"
						}`}
						onClick={() => setType("in")}
					>
						Ingreso
					</button>
					<button
						className={`rounded-md border px-3 py-1.5 text-xs ${
							type === "out"
								? "border-amber-300 bg-amber-50"
								: "border-slate-200"
						}`}
						onClick={() => setType("out")}
					>
						Egreso
					</button>
					<button
						className={`rounded-md border px-3 py-1.5 text-xs ${
							type === "adjust"
								? "border-sky-300 bg-sky-50"
								: "border-slate-200"
						}`}
						onClick={() => setType("adjust")}
					>
						Ajuste
					</button>
				</div>
				<div>
					<label className="text-sm font-medium">Cantidad</label>
					<input
						type="number"
						step="0.01"
						value={qty}
						onChange={(e) => setQty(parseFloat(e.target.value))}
						className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none ring-indigo-500 focus:ring-2"
					/>
				</div>
				<div>
					<label className="text-sm font-medium">Nota (opcional)</label>
					<input
						value={note}
						onChange={(e) => setNote(e.target.value)}
						className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none ring-indigo-500 focus:ring-2"
					/>
				</div>
			</div>

			<div className="mt-6 flex items-center justify-end gap-2">
				<Button variant="outline" onClick={onClose}>
					Cancelar
				</Button>
				<Button onClick={submit} disabled={loading}>
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
					Guardar
				</Button>
			</div>
		</Modal>
	);
}
