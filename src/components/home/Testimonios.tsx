"use client";

import { motion } from "framer-motion";
import { stagger, flyUp } from "./MotionUtils";

const ts = [
	{
		q: "El compromiso con los detalles llevó el proyecto a otro nivel.",
		a: "María G., promotora",
	},
	{
		q: "Excelente coordinación BIM, cero interferencias en obra.",
		a: "Ing. Luis P., contratista",
	},
	{
		q: "Diseño contemporáneo con lógica constructiva impecable.",
		a: "Jorge R., cliente residencial",
	},
];

const Testimonios = () => {
	return (
		<section className="py-16 md:py-24">
			<div className="mx-auto max-w-[1000px] px-4 sm:px-6 lg:px-8 text-center">
				<motion.h2
					variants={flyUp}
					initial="hidden"
					whileInView="show"
					viewport={{ once: true, margin: "-80px" }}
					className="text-2xl md:text-3xl font-semibold"
				>
					Testimonios
				</motion.h2>

				<motion.div
					variants={stagger(0.12)}
					initial="hidden"
					whileInView="show"
					viewport={{ once: true, margin: "-80px" }}
					className="mt-10 grid md:grid-cols-3 gap-5"
				>
					{ts.map((t) => (
						<motion.blockquote
							key={t.a}
							variants={flyUp}
							className="rounded-lg border border-black/10 dark:border-white/10 p-6 text-left"
						>
							<p className="text-sm leading-relaxed">“{t.q}”</p>
							<footer className="mt-3 text-xs opacity-70">— {t.a}</footer>
						</motion.blockquote>
					))}
				</motion.div>
			</div>
		</section>
	);
};

export default Testimonios;
