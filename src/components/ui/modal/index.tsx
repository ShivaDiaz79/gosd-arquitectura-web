"use client";
import React, { useRef, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";

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
	size?: "sm" | "md" | "lg" | "xl" | "2xl";
}

const sizeToMaxWidth: Record<NonNullable<ModalProps["size"]>, string> = {
	sm: "max-w-md",
	md: "max-w-lg",
	lg: "max-w-4xl",
	xl: "max-w-5xl",
	"2xl": "max-w-6xl",
};

const ModalPortal = ({ children }: { children: React.ReactNode }) => {
	const [mounted, setMounted] = useState(false);
	useEffect(() => setMounted(true), []);
	if (!mounted) return null;
	return createPortal(children, document.body);
};

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
	size = "lg",
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

	const overlayVariants = {
		hidden: { opacity: 0 },
		visible: { opacity: 1 },
		exit: { opacity: 0 },
	};
	const panelVariants = {
		hidden: { opacity: 0, y: 16, scale: 0.98 },
		visible: { opacity: 1, y: 0, scale: 1 },
		exit: { opacity: 0, y: 8, scale: 0.985 },
	};

	const basePanel =
		"relative w-full rounded-3xl bg-white dark:bg-gray-900 shadow-2xl ring-1 ring-black/5 z-[999999]";
	const widthPanel = sizeToMaxWidth[size];

	// contenedor scrollable interno (evita doble scroll)
	const scrollAreaClass = isFullscreen
		? "h-full overflow-y-auto overscroll-contain p-6 sm:p-8"
		: "max-h-[85vh] overflow-y-auto overscroll-contain p-6 sm:p-8";

	return (
		<AnimatePresence>
			{isOpen && (
				<ModalPortal>
					<div
						className="fixed inset-0 z-[999999] grid place-items-center p-4 sm:p-6"
						role="dialog"
						aria-modal="true"
					>
						{!isFullscreen && (
							<motion.button
								type="button"
								aria-label="Cerrar modal (overlay)"
								className="fixed inset-0 z-[999998] h-full w-full bg-black/40 backdrop-blur-sm"
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
							className={[
								isFullscreen
									? "fixed inset-0 z-[999999] w-screen h-screen bg-white dark:bg-gray-900"
									: `${basePanel} ${widthPanel} w-[92vw]`,
								className || "",
							].join(" ")}
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
									className="absolute right-3 top-3 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white sm:right-5 sm:top-5"
									aria-label="Cerrar"
								>
									<svg
										width="22"
										height="22"
										viewBox="0 0 24 24"
										fill="none"
										aria-hidden="true"
									>
										<path
											fillRule="evenodd"
											clipRule="evenodd"
											d="M6.04 16.54c-.39.39-.39 1.02 0 1.41.39.39 1.03.39 1.42 0L12 13.41l4.54 4.54c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L13.41 12l4.54-4.54c.39-.39.39-1.02 0-1.41a1 1 0 0 0-1.41 0L12 10.59 7.46 6.05a1 1 0 0 0-1.42 0c-.39.39-.39 1.02 0 1.41L10.59 12 6.04 16.54Z"
											fill="currentColor"
										/>
									</svg>
								</button>
							)}

							<div className={scrollAreaClass}>{children}</div>
						</motion.div>
					</div>
				</ModalPortal>
			)}
		</AnimatePresence>
	);
};
