"use client";

import { motion } from "framer-motion";
import { stagger, flyUp } from "./MotionUtils";

const Estudio = () => {
	return (
		<section className="py-14 md:py-20">
			<div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
				<motion.div
					variants={stagger()}
					initial="hidden"
					whileInView="show"
					viewport={{ once: true, margin: "-80px" }}
				>
					<motion.h2
						variants={flyUp}
						className="text-2xl md:text-3xl font-semibold"
					>
						Estudio
					</motion.h2>
					<motion.p
						variants={flyUp}
						className="mt-3 max-w-3xl text-black/70 dark:text-white/70"
					>
						Somos un equipo interdisciplinario que integra diseño, ingeniería y
						gestión. Trabajamos con análisis de sitio, modelado energético y
						coordinación BIM para asegurar calidad, costo y plazo.
					</motion.p>

					<motion.div
						variants={stagger(0.04)}
						className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4"
					>
						{[
							{ k: "+12", v: "años de práctica" },
							{ k: "BIM", v: "end to end" },
							{ k: "ISO", v: "estándares de calidad" },
							{ k: "LEED", v: "criterios de sostenibilidad" },
						].map((i) => (
							<motion.div
								key={i.k}
								variants={flyUp}
								className="rounded-lg border border-black/10 dark:border-white/10 p-4"
							>
								<div className="text-2xl font-semibold">{i.k}</div>
								<div className="text-sm text-black/70 dark:text-white/70">
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

export default Estudio;
