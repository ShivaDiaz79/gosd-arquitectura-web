"use client";

import { motion } from "framer-motion";
import { stagger, flyUp } from "./MotionUtils";

const Nosotros = () => {
	return (
		<section className="py-16 md:py-24">
			<div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
				<motion.div
					variants={stagger(0.12)}
					initial="hidden"
					whileInView="show"
					viewport={{ once: true, margin: "-80px" }}
				>
					<motion.h2
						variants={flyUp}
						className="text-2xl md:text-3xl font-semibold"
					>
						Nosotros
					</motion.h2>
					<motion.p
						variants={flyUp}
						className="mt-4 max-w-3xl text-black/70 dark:text-white/70"
					>
						En <strong>GOSD CONSTRUCTOR</strong> integramos arquitectura,
						ingeniería y obra. Trabajamos con coordinación BIM, planificación de
						obra y estándares de calidad para entregar proyectos sin sorpresas.
					</motion.p>

					<motion.div
						variants={stagger(0.1)}
						className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4"
					>
						{[
							{ k: "+12", v: "años construyendo" },
							{ k: "BIM", v: "coordinación integral" },
							{ k: "QHSE", v: "seguridad y calidad" },
							{ k: "On-time", v: "compromiso de plazos" },
						].map((i) => (
							<motion.div
								key={i.k}
								variants={flyUp}
								className="rounded-lg border border-black/10 dark:border-white/10 p-5"
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

export default Nosotros;
