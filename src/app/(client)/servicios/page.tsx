"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { flyUp, scaleIn, stagger } from "@/components/home/MotionUtils";

const servicios = [
	{
		title: "Diseño y arquitectura",
		desc: "Anteproyecto, proyecto ejecutivo y coordinación BIM.",
		href: "/servicios/diseno-arquitectonico",
	},
	{
		title: "Ejecución de obra",
		desc: "Construcción llave en mano con control de calidad y costos.",
		href: "/servicios/construccion",
	},
	{
		title: "Dirección y gerencia de proyectos",
		desc: "Planificación, cronogramas (Last Planner) y supervisión técnica.",
		href: "/servicios/direccion-de-obra",
	},
	{
		title: "Gestión de permisos",
		desc: "Tramitología municipal, compatibilidades y normativas.",
		href: "/servicios/gestion-de-permisos",
	},
];

export default function ServiciosIndex() {
	return (
		<main className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
			{/* Hero */}
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
							Servicios de GOSD CONSTRUCTOR
						</motion.h1>
						<motion.p
							variants={flyUp}
							className="mt-5 text-black/70 dark:text-white/70"
						>
							Soluciones integrales: diseño, permisos y construcción con
							metodología BIM, control de costos y compromiso de plazos.
						</motion.p>
					</motion.div>
				</div>
			</section>

			{/* Grid servicios */}
			<section className="py-16 md:py-24">
				<div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
					<motion.div
						variants={stagger(0.12)}
						initial="hidden"
						whileInView="show"
						viewport={{ once: true, margin: "-80px" }}
						className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5"
					>
						{servicios.map((s) => (
							<motion.article
								key={s.title}
								variants={scaleIn}
								className="rounded-lg border border-black/10 dark:border-white/10 p-6"
							>
								<h3 className="font-medium">{s.title}</h3>
								<p className="mt-2 text-sm text-black/70 dark:text-white/70">
									{s.desc}
								</p>
								<Link
									href={s.href}
									className="mt-5 inline-flex text-sm underline underline-offset-4"
								>
									Ver servicio →
								</Link>
							</motion.article>
						))}
					</motion.div>
				</div>
			</section>

			{/* Diferenciales */}
			<section className="py-16 md:py-24 border-t border-black/10 dark:border-white/10">
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
							Por qué GOSD CONSTRUCTOR
						</motion.h2>
						<motion.ul
							variants={stagger(0.1)}
							className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-5"
						>
							{[
								{
									t: "BIM end-to-end",
									d: "Coordinación temprana de especialidades.",
								},
								{
									t: "Control de costos",
									d: "Presupuestos y seguimiento de desvíos.",
								},
								{ t: "Calidad y seguridad", d: "Estándares QHSE en obra." },
								{
									t: "Plazos fiables",
									d: "Planificación y Last Planner System.",
								},
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
					</motion.div>
				</div>
			</section>

			{/* Proceso resumido */}
			<section className="py-16 md:py-24">
				<div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
					<motion.h2
						variants={flyUp}
						initial="hidden"
						whileInView="show"
						viewport={{ once: true, margin: "-80px" }}
						className="text-2xl md:text-3xl font-semibold"
					>
						Proceso de trabajo
					</motion.h2>
					<motion.ol
						variants={stagger(0.12)}
						initial="hidden"
						whileInView="show"
						viewport={{ once: true, margin: "-80px" }}
						className="mt-8 grid sm:grid-cols-2 lg:grid-cols-6 gap-4"
					>
						{[
							"Brief",
							"Análisis",
							"Diseño",
							"Ejecutivo",
							"Permisos",
							"Construcción",
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

			{/* FAQs */}
			<section className="py-16 md:py-24 border-t border-black/10 dark:border-white/10">
				<div className="mx-auto max-w-[1000px] px-4 sm:px-6 lg:px-8">
					<motion.h2
						variants={flyUp}
						initial="hidden"
						whileInView="show"
						viewport={{ once: true, margin: "-80px" }}
						className="text-2xl md:text-3xl font-semibold"
					>
						Preguntas frecuentes
					</motion.h2>
					<motion.div
						variants={stagger(0.12)}
						initial="hidden"
						whileInView="show"
						viewport={{ once: true, margin: "-80px" }}
						className="mt-8 space-y-4"
					>
						{[
							{
								q: "¿Trabajan con presupuesto objetivo?",
								a: "Sí, definimos alcance y estándares para alinear el costo objetivo desde el inicio.",
							},
							{
								q: "¿Pueden tomar proyectos ya iniciados?",
								a: "Evaluamos el estado (anteproyecto/ejecutivo) y proponemos un plan de regularización y continuidad.",
							},
							{
								q: "¿Qué incluye el servicio llave en mano?",
								a: "Desde diseño y permisos hasta construcción, supervisión y entrega con documentación as-built.",
							},
						].map((f) => (
							<motion.details
								key={f.q}
								variants={scaleIn}
								className="rounded-lg border border-black/10 dark:border-white/10 p-5"
							>
								<summary className="font-medium cursor-pointer">{f.q}</summary>
								<p className="mt-2 text-sm text-black/70 dark:text-white/70">
									{f.a}
								</p>
							</motion.details>
						))}
					</motion.div>
				</div>
			</section>

			{/* CTA */}
			<section className="py-20 md:py-28">
				<div className="mx-auto max-w-[900px] px-4 sm:px-6 lg:px-8 text-center">
					<motion.div
						variants={scaleIn}
						initial="hidden"
						whileInView="show"
						viewport={{ once: true, margin: "-80px" }}
						className="rounded-2xl border border-black/10 dark:border-white/10 p-10 md:p-14"
					>
						<motion.h3
							variants={flyUp}
							className="text-2xl md:text-3xl font-semibold"
						>
							¿Listo para empezar con GOSD CONSTRUCTOR?
						</motion.h3>
						<motion.p
							variants={flyUp}
							className="mt-4 text-black/70 dark:text-white/70"
						>
							Agenda una reunión para revisar alcance, tiempos y presupuesto.
						</motion.p>
						<motion.div
							variants={flyUp}
							className="mt-7 flex items-center justify-center gap-3"
						>
							<Link
								href="/contacto"
								className="inline-flex items-center rounded-md px-5 py-2.5 text-sm bg-black text-white dark:bg-white/10 dark:text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/30"
							>
								Contacto
							</Link>
							<Link
								href="/obras"
								className="inline-flex items-center rounded-md px-5 py-2.5 text-sm border border-black/15 dark:border-white/20 hover:bg-black/5 dark:hover:bg-white/10"
							>
								Ver obras
							</Link>
						</motion.div>
					</motion.div>
				</div>
			</section>
		</main>
	);
}
