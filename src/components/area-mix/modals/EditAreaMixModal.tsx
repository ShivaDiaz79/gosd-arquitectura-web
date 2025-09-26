"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import AreaMixForm from "../AreaMixForm";
import { AreaMixService } from "@/services/AreaMixService";
import type { AreaMixRow } from "@/lib/types/area-mix.type";

export default function EditAreaMixModal({
	isOpen,
	onClose,
	mixId,
	onSaved,
	showCloseButton = true,
	isFullscreen = false,
}: {
	isOpen: boolean;
	onClose: () => void;
	mixId: string;
	onSaved?: () => void;
	showCloseButton?: boolean;
	isFullscreen?: boolean;
}) {
	const [loading, setLoading] = useState(true);
	const [mix, setMix] = useState<AreaMixRow | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let active = true;
		async function load() {
			setError(null);
			setLoading(true);
			try {
				const it = await AreaMixService.getById(mixId);
				if (!active) return;
				setMix(it);
			} catch (e: any) {
				if (!active) return;
				setError(e?.message || "No se pudo cargar.");
			} finally {
				if (active) setLoading(false);
			}
		}
		if (isOpen && mixId) load();
		return () => {
			active = false;
		};
	}, [isOpen, mixId]);

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			className="max-w-3xl p-6 sm:p-8"
			showCloseButton={showCloseButton}
			isFullscreen={isFullscreen}
		>
			<h3 className="mb-2 text-lg font-semibold">Editar perfil de mezcla</h3>
			<p className="mb-5 text-sm text-gray-500">Ajusta porcentajes y datos.</p>
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
			) : !mix ? (
				<div className="text-sm text-slate-600">Perfil no encontrado.</div>
			) : (
				<AreaMixForm
					mix={mix}
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
