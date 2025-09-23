"use client";

import { motion } from "framer-motion";
import { stagger, flyUp, scaleIn } from "./MotionUtils";

const pasos = [
	{ n: "01", t: "Análisis", d: "Programa, contexto y viabilidad." },
	{ n: "02", t: "Diseño", d: "Iteraciones y definición conceptual." },
	{ n: "03", t: "Proyecto ejecutivo", d: "Detalles, especialidades y BIM." },
	{ n: "04", t: "Permisos", d: "Gestión normativa y compatibilidades." },
	{ n: "05", t: "Construcción", d: "Dirección de obra y control de calidad." },
	{ n: "06", t: "Entrega", d: "Puesta en marcha y documentos as-built." },
];

const Proceso = () => {
	return (
		<section className="py-16 md:py-24 border-t border-black/10 dark:border-white/10">
			<div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
				<h2 className="text-2xl md:text-3xl font-semibold">Proceso</h2>
				<motion.ol
					variants={stagger(0.12)}
					initial="hidden"
					whileInView="show"
					viewport={{ once: true, margin: "-80px" }}
					className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
				>
					{pasos.map((p) => (
						<motion.li
							key={p.n}
							variants={scaleIn}
							className="rounded-lg border border-black/10 dark:border-white/10 p-6"
						>
							<div className="text-xs opacity-70">{p.n}</div>
							<div className="mt-1 font-medium">{p.t}</div>
							<div className="text-sm text-black/70 dark:text-white/70">
								{p.d}
							</div>
						</motion.li>
					))}
				</motion.ol>
			</div>
		</section>
	);
};

export default Proceso;
