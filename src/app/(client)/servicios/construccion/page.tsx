"use client";

import { motion } from "framer-motion";
import { flyUp, scaleIn, stagger } from "@/components/home/MotionUtils";
import Link from "next/link";

export default function Construccion() {
	return (
		<main className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
			<section className="border-b border-black/10 dark:border-white/10">
				<div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 py-20 md:py-28">
					<motion.div
						variants={stagger(0.12)}
						initial="hidden"
						animate="show"
						className="max-w-3xl"
					>
						<motion.h1
							variants={flyUp}
							className="text-4xl md:text-5xl font-semibold tracking-tight"
						>
							Ejecución de obra
						</motion.h1>
						<motion.p
							variants={flyUp}
							className="mt-5 text-black/70 dark:text-white/70"
						>
							Construcción llave en mano con control de calidad, seguridad
							(QHSE) y costos. Planificación de plazos y gestión de
							contratistas.
						</motion.p>
					</motion.div>
				</div>
			</section>

			<section className="py-16 md:py-24">
				<div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
					<motion.h2
						variants={flyUp}
						initial="hidden"
						whileInView="show"
						viewport={{ once: true, margin: "-80px" }}
						className="text-2xl md:text-3xl font-semibold"
					>
						Beneficios
					</motion.h2>
					<motion.ul
						variants={stagger(0.12)}
						initial="hidden"
						whileInView="show"
						viewport={{ once: true, margin: "-80px" }}
						className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
					>
						{[
							{
								t: "On-time delivery",
								d: "Plan maestro y seguimiento semanal.",
							},
							{
								t: "Calidad verificable",
								d: "Checklists y control de recepción.",
							},
							{ t: "Seguridad en obra", d: "Protocolos QHSE y capacitación." },
						].map((x) => (
							<motion.li
								key={x.t}
								variants={scaleIn}
								className="rounded-lg border border-black/10 dark:border-white/10 p-6"
							>
								<div className="font-medium">{x.t}</div>
								<div className="text-sm text-black/70 dark:text-white/70">
									{x.d}
								</div>
							</motion.li>
						))}
					</motion.ul>
				</div>
			</section>

			<section className="py-16 md:py-24 border-t border-black/10 dark:border-white/10">
				<div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
					<motion.h2
						variants={flyUp}
						initial="hidden"
						whileInView="show"
						viewport={{ once: true, margin: "-80px" }}
						className="text-2xl md:text-3xl font-semibold"
					>
						Alcance del servicio
					</motion.h2>
					<motion.div
						variants={stagger(0.1)}
						initial="hidden"
						whileInView="show"
						viewport={{ once: true, margin: "-80px" }}
						className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
					>
						{[
							"Logística y acopios",
							"Contratación y coordinación de rubros",
							"Control de calidad y recepción",
							"Gestión de cambios y costos",
							"Seguridad y ambiente (QHSE)",
							"Documentación as-built y entrega",
						].map((i) => (
							<motion.div
								key={i}
								variants={scaleIn}
								className="rounded-lg border border-black/10 dark:border-white/10 p-5"
							>
								<div className="text-sm">{i}</div>
							</motion.div>
						))}
					</motion.div>
				</div>
			</section>

			<section className="py-16 md:py-24">
				<div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
					<motion.h2
						variants={flyUp}
						initial="hidden"
						whileInView="show"
						viewport={{ once: true, margin: "-80px" }}
						className="text-2xl md:text-3xl font-semibold"
					>
						Proceso de construcción
					</motion.h2>
					<motion.ol
						variants={stagger(0.12)}
						initial="hidden"
						whileInView="show"
						viewport={{ once: true, margin: "-80px" }}
						className="mt-8 grid sm:grid-cols-2 lg:grid-cols-6 gap-4"
					>
						{[
							"Inicio",
							"Hitos",
							"Rúbricas",
							"Control",
							"Entrega",
							"Cierre",
						].map((p, i) => (
							<motion.li
								key={p}
								variants={scaleIn}
								className="rounded-lg border border-black/10 dark:border-white/10 p-4"
							>
								<div className="text-xs opacity-70">
									{String(i + 1).padStart(2, "0")}
								</div>
								<div className="font-medium">{p}</div>
							</motion.li>
						))}
					</motion.ol>
				</div>
			</section>

			<section className="py-20 md:py-28 border-t border-black/10 dark:border-white/10">
				<div className="mx-auto max-w-[900px] px-4 sm:px-6 lg:px-8 text-center">
					<motion.h3
						variants={flyUp}
						initial="hidden"
						whileInView="show"
						viewport={{ once: true, margin: "-80px" }}
						className="text-2xl md:text-3xl font-semibold"
					>
						Construyamos con GOSD CONSTRUCTOR
					</motion.h3>
					<motion.div
						variants={stagger(0.12)}
						initial="hidden"
						whileInView="show"
						viewport={{ once: true, margin: "-80px" }}
						className="mt-6 flex justify-center gap-3"
					>
						<Link
							href="/contacto"
							className="inline-flex rounded-md px-5 py-2.5 text-sm bg-black text-white dark:bg-white/10 dark:text-white"
						>
							Contactar
						</Link>
						<Link
							href="/obras"
							className="inline-flex rounded-md px-5 py-2.5 text-sm border border-black/15 dark:border-white/20"
						>
							Ver obras
						</Link>
					</motion.div>
				</div>
			</section>
		</main>
	);
}
