"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { scaleIn, flyUp } from "./MotionUtils";

const CTA = () => {
	return (
		<section className="py-20 md:py-28 border-t border-black/10 dark:border-white/10">
			<div className="mx-auto max-w-[1000px] px-4 sm:px-6 lg:px-8 text-center">
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
						¿Construimos tu proyecto con GOSD CONSTRUCTOR?
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
							className="inline-flex items-center rounded-md px-5 py-2.5 text-sm bg-black text-white dark:bg_white/10 dark:bg-white/10 dark:text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/30"
						>
							Contacto
						</Link>
						<Link
							href="/servicios"
							className="inline-flex items-center rounded-md px-5 py-2.5 text-sm border border-black/15 dark:border-white/20 hover:bg-black/5 dark:hover:bg-white/10"
						>
							Servicios
						</Link>
					</motion.div>
				</motion.div>
			</div>
		</section>
	);
};

export default CTA;
