"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { stagger, flyUp, scaleIn } from "./MotionUtils";

const servicios = [
	{
		title: "Diseño y arquitectura",
		desc: "Anteproyecto, ejecutivo y coordinación BIM.",
		href: "/servicios/diseno-arquitectonico",
	},
	{
		title: "Ejecución de obra",
		desc: "Construcción llave en mano, control de calidad y costos.",
		href: "/servicios/construccion",
	},
	{
		title: "Dirección y gerencia de proyectos",
		desc: "Planificación, cronogramas y supervisión técnica.",
		href: "/servicios/direccion-de-obra",
	},
	{
		title: "Gestión de permisos",
		desc: "Tramitología municipal, compatibilidades y normativas.",
		href: "/servicios/gestion-de-permisos",
	},
];

const Servicios = () => {
	return (
		<section className="py-16 md:py-24 border-t border-black/10 dark:border-white/10">
			<div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
				<div className="flex items-end justify-between gap-4">
					<h2 className="text-2xl md:text-3xl font-semibold">Servicios</h2>
					<Link
						href="/servicios"
						className="text-sm underline underline-offset-4 hover:opacity-80"
					>
						Ver todos
					</Link>
				</div>

				<motion.div
					variants={stagger(0.12)}
					initial="hidden"
					whileInView="show"
					viewport={{ once: true, margin: "-80px" }}
					className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-5"
				>
					{servicios.map((s) => (
						<motion.article
							key={s.title}
							variants={scaleIn}
							className="group rounded-lg border border-black/10 dark:border-white/10 p-6 hover:shadow-sm transition-shadow"
						>
							<h3 className="font-medium">{s.title}</h3>
							<p className="mt-2 text-sm text-black/70 dark:text-white/70">
								{s.desc}
							</p>
							<Link
								href={s.href}
								className="mt-5 inline-flex items-center text-sm underline underline-offset-4 group-hover:no-underline"
							>
								Saber más →
							</Link>
						</motion.article>
					))}
				</motion.div>
			</div>
		</section>
	);
};

export default Servicios;
