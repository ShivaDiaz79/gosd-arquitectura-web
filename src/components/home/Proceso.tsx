"use client";

import { motion, useReducedMotion } from "framer-motion";
import { stagger, scaleIn } from "./MotionUtils"; // ya lo usabas
import { useProcesoContent } from "@/hooks/useProcesoContent";
import type { ProcesoPaso } from "@/lib/types/proceso.type";

function Skeleton() {
	return (
		<div className="mt-10 grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
			{Array.from({ length: 6 }).map((_, i) => (
				<div
					key={i}
					className="animate-pulse rounded-lg border border-black/10 dark:border-white/10 p-6"
				>
					<div className="h-3 w-10 rounded bg-black/10 dark:bg-white/10" />
					<div className="mt-2 h-4 w-32 rounded bg-black/10 dark:bg-white/10" />
					<div className="mt-2 h-3 w-full rounded bg-black/10 dark:bg-white/10" />
				</div>
			))}
		</div>
	);
}

export default function Proceso() {
	const { data, loading, error, reload } = useProcesoContent();
	const prefersReducedMotion = useReducedMotion();

	const title = data?.title || "Proceso";
	const steps = (data?.steps || []) as ProcesoPaso[];

	return (
		<section className="py-14 md:py-20 border-t border-black/10 dark:border-white/10">
			<div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
				<div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
					<h2 className="text-2xl md:text-3xl font-semibold">{title}</h2>

					{error && (
						<button
							onClick={reload}
							className="inline-flex items-center rounded-md border border-black/15 bg-white px-3 py-1.5 text-xs hover:bg-black/5 dark:bg-gray-900"
							title="Reintentar"
						>
							Reintentar
						</button>
					)}
				</div>

				{loading ? (
					<Skeleton />
				) : error ? (
					<div className="mt-6 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/15 dark:text-rose-300">
						{error}
					</div>
				) : steps.length === 0 ? (
					<div className="mt-6 text-sm text-slate-600 dark:text-slate-300">
						No hay pasos para mostrar.
					</div>
				) : (
					<motion.ol
						variants={stagger(prefersReducedMotion ? 0 : 0.12)}
						initial="hidden"
						whileInView="show"
						viewport={{ once: true, margin: "-80px" }}
						className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
					>
						{steps.map((p, idx) => (
							<motion.li
								key={`${p.n}-${idx}`}
								variants={prefersReducedMotion ? undefined : scaleIn}
								className="rounded-lg border border-black/10 dark:border-white/10 p-6"
							>
								<div className="text-xs opacity-70">
									{p.n || String(idx + 1).padStart(2, "0")}
								</div>
								<div className="mt-1 font-medium line-clamp-1">
									{p.t || "Título"}
								</div>
								<div className="text-sm text-black/70 dark:text-white/70 mt-0.5 line-clamp-3">
									{p.d || "Descripción breve"}
								</div>
							</motion.li>
						))}
					</motion.ol>
				)}
			</div>
		</section>
	);
}
