"use client";
import React, { useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	className?: string;
	children: React.ReactNode;
	showCloseButton?: boolean;
	isFullscreen?: boolean;
	autoCloseMs?: number;
	disableManualClose?: boolean;
	closeOnOverlay?: boolean;
	closeOnEsc?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
	isOpen,
	onClose,
	children,
	className,
	showCloseButton = true,
	isFullscreen = false,
	autoCloseMs,
	disableManualClose = false,
	closeOnOverlay = true,
	closeOnEsc = true,
}) => {
	const modalRef = useRef<HTMLDivElement>(null);

	const canManualClose = !disableManualClose;
	const showX = showCloseButton && canManualClose;

	useEffect(() => {
		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === "Escape" && canManualClose && closeOnEsc) onClose();
		};
		if (isOpen) document.addEventListener("keydown", handleEscape);
		return () => document.removeEventListener("keydown", handleEscape);
	}, [isOpen, onClose, canManualClose, closeOnEsc]);

	useEffect(() => {
		document.body.style.overflow = isOpen ? "hidden" : "unset";
		return () => {
			document.body.style.overflow = "unset";
		};
	}, [isOpen]);

	useEffect(() => {
		if (!isOpen || !autoCloseMs || autoCloseMs <= 0) return;
		const t = window.setTimeout(() => onClose(), autoCloseMs);
		return () => window.clearTimeout(t);
	}, [isOpen, autoCloseMs, onClose]);

	const contentClasses = isFullscreen
		? "fixed inset-0 w-screen h-screen"
		: [
				"relative w-full",
				"max-w-[80vw] max-h-[80vh]",
				"overflow-auto",
				"rounded-3xl bg-white dark:bg-gray-900",
				"mx-auto",
		  ].join(" ");

	const overlayVariants = {
		hidden: { opacity: 0 },
		visible: { opacity: 1 },
		exit: { opacity: 0 },
	};
	const panelVariants = {
		hidden: { opacity: 0, y: 20, scale: 0.98 },
		visible: { opacity: 1, y: 0, scale: 1 },
		exit: { opacity: 0, y: 10, scale: 0.98 },
	};

	return (
		<AnimatePresence>
			{isOpen && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 sm:p-6"
					role="dialog"
					aria-modal="true"
				>
					{!isFullscreen && (
						<motion.div
							className="fixed inset-0 h-full w-full bg-gray-400/50 backdrop-blur-[24px]"
							initial="hidden"
							animate="visible"
							exit="exit"
							variants={overlayVariants}
							transition={{ duration: 0.18, ease: "easeOut" }}
							onClick={() => {
								if (canManualClose && closeOnOverlay) onClose();
							}}
						/>
					)}

					<motion.div
						ref={modalRef}
						className={`${contentClasses} ${className || ""}`}
						onClick={(e) => e.stopPropagation()}
						initial="hidden"
						animate="visible"
						exit="exit"
						variants={panelVariants}
						transition={{ duration: 0.22, ease: "easeOut" }}
					>
						{showX && (
							<button
								onClick={onClose}
								className="absolute right-3 top-3 z-10 flex h-9.5 w-9.5 items-center justify-center rounded-full bg-gray-100 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white sm:right-6 sm:top-6 sm:h-11 sm:w-11"
								aria-label="Cerrar"
							>
								<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
									<path
										fillRule="evenodd"
										clipRule="evenodd"
										d="M6.04289 16.5413C5.65237 16.9318 5.65237 17.565 6.04289 17.9555C6.43342 18.346 7.06658 18.346 7.45711 17.9555L11.9987 13.4139L16.5408 17.956C16.9313 18.3466 17.5645 18.3466 17.955 17.956C18.3455 17.5655 18.3455 16.9323 17.955 16.5418L13.4129 11.9997L17.955 7.4576C18.3455 7.06707 18.3455 6.43391 17.955 6.04338C17.5645 5.65286 16.9313 5.65286 16.5408 6.04338L11.9987 10.5855L7.45711 6.0439C7.06658 5.65338 6.43342 5.65338 6.04289 6.0439C5.65237 6.43442 5.65237 7.06759 6.04289 7.45811L10.5845 11.9997L6.04289 16.5413Z"
										fill="currentColor"
									/>
								</svg>
							</button>
						)}
						<div className={isFullscreen ? "" : "p-0"}>{children}</div>
					</motion.div>
				</div>
			)}
		</AnimatePresence>
	);
};
