"use client";
import React, { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";

type ConfirmDeleteModalProps = {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => Promise<void> | void;
	title?: string;
	description?: string;
	confirmLabel?: string;
	cancelLabel?: string;
	disableOutsideClose?: boolean;
};

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
	isOpen,
	onClose,
	onConfirm,
	title = "Eliminar elemento",
	description = "Esta acción no se puede deshacer.",
	confirmLabel = "Eliminar",
	cancelLabel = "Cancelar",
	disableOutsideClose = true,
}) => {
	const [submitting, setSubmitting] = useState(false);

	useEffect(() => {
		if (!isOpen) setSubmitting(false);
	}, [isOpen]);

	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Enter" && isOpen && !submitting) {
				e.preventDefault();
				void handleConfirm();
			}
		};
		if (isOpen) window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [isOpen, submitting]);

	const handleConfirm = async () => {
		try {
			setSubmitting(true);
			await onConfirm();
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			className="max-w-[440px] p-6"
			showCloseButton={false}
			disableManualClose={disableOutsideClose}
			closeOnOverlay={!disableOutsideClose}
			closeOnEsc={!disableOutsideClose}
		>
			<div className="flex items-start gap-4">
				<div className="mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400">
					{/* Trash icon */}
					<svg width="22" height="22" viewBox="0 0 24 24" fill="none">
						<path
							d="M9 3h6m-9 4h12M7 7l1 12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2L17 7M10 11v6m4-6v6"
							stroke="currentColor"
							strokeWidth="1.6"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
				</div>

				<div className="flex-1">
					<h3 className="text-lg font-semibold text-gray-900 dark:text-white/90">
						{title}
					</h3>
					{description && (
						<p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
							{description}
						</p>
					)}

					<div className="mt-6 flex justify-end gap-3">
						<button
							type="button"
							onClick={onClose}
							disabled={submitting}
							className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/[0.03]"
						>
							{cancelLabel}
						</button>
						<button
							type="button"
							onClick={handleConfirm}
							disabled={submitting}
							className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
						>
							{submitting ? "Eliminando..." : confirmLabel}
						</button>
					</div>
				</div>
			</div>
		</Modal>
	);
};
