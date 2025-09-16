"use client";

import { JSX, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ChevronDownIcon } from "@/icons";

type ItemKey =
	| "servicios"
	| "categorias"
	| "entregables"
	| "ejecutables"
	| "cotizador";

type AccordionItemProps = {
	id: ItemKey;
	title: string;
	children: React.ReactNode;
	openKey: ItemKey | null;
	setOpenKey: (k: ItemKey | null) => void;
	level?: 2 | 3 | 4;
};

export default function AccordionItem({
	id,
	title,
	children,
	openKey,
	setOpenKey,
	level = 2,
}: AccordionItemProps) {
	const isOpen = openKey === id;
	const prefersReducedMotion = useReducedMotion();

	const HeadingTag = `h${level}` as unknown as keyof JSX.IntrinsicElements;
	const regionId = `${id}-region`;

	const onToggle = () => setOpenKey(isOpen ? null : id);

	return (
		<section
			id={id}
			aria-labelledby={`${id}-heading`}
			className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900"
		>
			<HeadingTag
				id={`${id}-heading`}
				className="border-b border-gray-100 dark:border-gray-800"
			>
				<button
					type="button"
					onClick={onToggle}
					aria-expanded={isOpen}
					aria-controls={regionId}
					className="flex w-full items-center justify-between px-5 py-4 text-left"
				>
					<span className="text-base font-semibold">{title}</span>
					<motion.span
						animate={{ rotate: isOpen ? 180 : 0 }}
						transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
						className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-gray-200 text-gray-500 dark:border-gray-700"
					>
						<ChevronDownIcon className="h-4 w-4" />
					</motion.span>
				</button>
			</HeadingTag>

			<AnimatePresence initial={false}>
				{isOpen && (
					<motion.div
						id={regionId}
						role="region"
						aria-labelledby={`${id}-heading`}
						key="content"
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: "auto", opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{
							duration: prefersReducedMotion ? 0 : 0.25,
							ease: "easeInOut",
						}}
						className="overflow-hidden"
					>
						<div className="px-5 py-5">{children}</div>
					</motion.div>
				)}
			</AnimatePresence>
		</section>
	);
}
