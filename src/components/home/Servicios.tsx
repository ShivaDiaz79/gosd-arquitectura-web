"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { stagger, flyUp, scaleIn } from "./MotionUtils";
import { useServicesContent } from "@/hooks/useServicesContent";

const Servicios = () => {
	const { data, loading } = useServicesContent();

	const heading = loading ? "Cargando…" : data?.heading ?? "Servicios";
	const ctaText = data?.ctaText ?? "Ver todos";
	const ctaHref = data?.ctaHref ?? "/servicios";
	const items = data?.items ?? [];

	const list = items.length
		? items
		: Array.from({ length: 4 }).map((_, i) => ({
				title: `Servicio ${i + 1}`,
				desc: "Descripción breve…",
				href: "#",
		  }));

	return (
		<section className="py-14 md:py-20 lg:py-24 border-t border-black/10 dark:border-white/10">
			<div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
				<div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4">
					<h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold leading-tight">
						{heading}
					</h2>
					<Link
						href={ctaHref}
						className="text-sm sm:text-base underline underline-offset-4 hover:opacity-80 self-start sm:self-auto"
					>
						{ctaText}
					</Link>
				</div>

				<motion.div
					variants={stagger(0.12)}
					initial="hidden"
					whileInView="show"
					viewport={{ once: true, margin: "-80px" }}
					className="mt-8 sm:mt-10"
					style={{
						display: "grid",
						gap: "16px",
						gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
					}}
				>
					{list.map((s) => (
						<motion.article
							key={`${s.title}-${s.href}`}
							variants={scaleIn}
							className="group rounded-lg border border-black/10 dark:border-white/10 overflow-hidden"
						>
							<Link
								href={s.href}
								className="flex h-full flex-col p-5 sm:p-6 hover:bg-black/[0.02] dark:hover:bg-white/[0.04] transition-colors"
							>
								<h3 className="text-base sm:text-lg font-medium leading-snug">
									{s.title}
								</h3>
								<p className="mt-2 text-sm sm:text-[15px] text-black/70 dark:text-white/70">
									{s.desc}
								</p>
								<span className="mt-4 sm:mt-5 inline-flex items-center text-sm underline underline-offset-4 group-hover:no-underline">
									Saber más →
								</span>
							</Link>
						</motion.article>
					))}
				</motion.div>
			</div>
		</section>
	);
};

export default Servicios;
