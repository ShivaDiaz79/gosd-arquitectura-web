"use client";

import { motion } from "framer-motion";
import { stagger, flyUp } from "./MotionUtils";
import { useAboutContent } from "@/hooks/useAboutContent";
import { useMemo } from "react";

type Stat = { k: string; v: string };

const DEFAULT_STATS: Stat[] = [
	{ k: "+12", v: "años construyendo" },
	{ k: "BIM", v: "coordinación integral" },
	{ k: "QHSE", v: "seguridad y calidad" },
	{ k: "On-time", v: "compromiso de plazos" },
];

function normalizeStats(raw: any): Stat[] {
	if (!raw) return DEFAULT_STATS;

	if (Array.isArray(raw) && raw.length && typeof raw[0] === "string") {
		const parsed = raw
			.map((s) => {
				const [k, ...rest] = String(s).split(":");
				const v = rest.join(":").trim();
				return { k: k?.trim(), v: v || "" };
			})
			.filter((x) => x.k);
		return parsed.length ? parsed.slice(0, 8) : DEFAULT_STATS;
	}

	if (Array.isArray(raw)) {
		const mapped = raw
			.map((it) => {
				if (!it || typeof it !== "object") return null;
				const k =
					it.k ?? it.key ?? it.label ?? it.title ?? it.clave ?? it.head ?? "";
				const v =
					it.v ??
					it.value ??
					it.subtitle ??
					it.text ??
					it.valor ??
					it.body ??
					"";
				const ks = String(k || "").trim();
				const vs = String(v || "").trim();
				if (!ks) return null;
				return { k: ks, v: vs } as Stat;
			})
			.filter(Boolean) as Stat[];
		return mapped.length ? mapped.slice(0, 8) : DEFAULT_STATS;
	}

	return DEFAULT_STATS;
}

const Nosotros = () => {
	const { data, loading } = useAboutContent();
	const stats = useMemo(() => normalizeStats(data?.stats), [data?.stats]);

	return (
		<section className="py-14 md:py-20 lg:py-24">
			<div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
				<motion.div
					variants={stagger(0.12)}
					initial="hidden"
					whileInView="show"
					viewport={{ once: true, margin: "-80px" }}
				>
					<motion.h2
						variants={flyUp}
						className="text-2xl sm:text-3xl md:text-4xl font-semibold leading-tight"
					>
						{loading ? "Cargando…" : data?.title ?? "Nosotros"}
					</motion.h2>

					<motion.p
						variants={flyUp}
						className="mt-3 sm:mt-4 md:mt-5 max-w-prose text-base sm:text-lg text-black/70 dark:text-white/70"
					>
						{loading ? "" : data?.intro ?? ""}
					</motion.p>

					<motion.div
						variants={stagger(0.08)}
						className="mt-8 sm:mt-10"
						style={{
							display: "grid",
							gap: "12px",
							gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
						}}
					>
						{stats.map((i, idx) => (
							<motion.div
								key={`${i.k}-${i.v}-${idx}`}
								variants={flyUp}
								className="rounded-lg border border-black/10 dark:border-white/10 p-4 sm:p-5 h-full"
							>
								<div className="text-xl sm:text-2xl md:text-3xl font-semibold">
									{i.k}
								</div>
								<div className="mt-1 text-xs sm:text-sm text-black/70 dark:text-white/70">
									{i.v}
								</div>
							</motion.div>
						))}
					</motion.div>
				</motion.div>
			</div>
		</section>
	);
};

export default Nosotros;
