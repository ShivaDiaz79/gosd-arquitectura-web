"use client";
import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import MaterialForm from "../MaterialForm";
import { MaterialsService } from "@/services/MaterialsService";
import type { MaterialRow } from "@/lib/types/material.type";

export default function EditMaterialModal({
	isOpen,
	onClose,
	materialId,
	onSaved,
	showCloseButton = true,
	isFullscreen = false,
}: {
	isOpen: boolean;
	onClose: () => void;
	materialId: string;
	onSaved?: () => void;
	showCloseButton?: boolean;
	isFullscreen?: boolean;
}) {
	const [loading, setLoading] = useState(true);
	const [material, setMaterial] = useState<MaterialRow | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let active = true;
		async function load() {
			setError(null);
			setLoading(true);
			try {
				const it = await MaterialsService.getById(materialId);
				if (!active) return;
				setMaterial(it);
			} catch (e: any) {
				if (!active) return;
				setError(e?.message || "No se pudo cargar el material.");
			} finally {
				if (active) setLoading(false);
			}
		}
		if (isOpen && materialId) load();
		return () => {
			active = false;
		};
	}, [isOpen, materialId]);

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			className="max-w-4xl p-6 sm:p-8"
			showCloseButton={showCloseButton}
			isFullscreen={isFullscreen}
		>
			<h3 className="mb-2 text-lg font-semibold">Editar material</h3>
			<p className="mb-5 text-sm text-gray-500">
				Actualiza datos, precios e imágenes.
			</p>
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
			) : !material ? (
				<div className="text-sm text-slate-600">Material no encontrado.</div>
			) : (
				<MaterialForm
					material={material}
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
