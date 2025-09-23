"use client";

import {
	motion,
	useReducedMotion,
	useScroll,
	useTransform,
} from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

const HeroBanner = () => {
	const prefersReduced = useReducedMotion();
	const ref = useRef<HTMLDivElement>(null);

	const { scrollYProgress } = useScroll({
		target: ref,
		offset: ["start start", "end start"],
	});

	const yBg = useTransform(
		scrollYProgress,
		[0, 1],
		[0, prefersReduced ? 0 : 60]
	);
	const yTitle = useTransform(
		scrollYProgress,
		[0, 1],
		[0, prefersReduced ? 0 : -40]
	);
	const ySub = useTransform(
		scrollYProgress,
		[0, 1],
		[0, prefersReduced ? 0 : -20]
	);

	return (
		<section
			ref={ref}
			className="relative h-[90vh] min-h-[560px] overflow-hidden border-b border-black/10 dark:border-white/10"
		>
			<motion.div aria-hidden style={{ y: yBg }} className="absolute inset-0">
				<img
					src="https://content.arquitecturaydiseno.es/medio/2017/03/08/apartamentos12_c3121e4b.png"
					alt=""
					sizes="100vw"
					className="object-cover"
				/>
			</motion.div>

			<div className="absolute inset-0 bg-white/35 dark:bg-black/45 backdrop-blur-[1px]" />

			<div className="relative z-10 mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 h-full flex items-center">
				<div>
					<motion.h1
						style={{ y: yTitle }}
						initial={{ y: 24, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						transition={{ type: "spring", stiffness: 140, damping: 22 }}
						className="text-4xl sm:text-5xl md:text-6xl tracking-tight font-semibold"
					>
						GOSD CONSTRUCTOR
					</motion.h1>

					<motion.p
						style={{ y: ySub }}
						initial={{ y: 18, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						transition={{ delay: 0.1, duration: 0.7 }}
						className="mt-4 max-w-2xl text-base sm:text-lg text-black/85 dark:text-white/85"
					>
						Diseño, permisos y ejecución llave en mano. Precisión BIM y control
						de costos, plazos y calidad.
					</motion.p>

					<motion.div
						initial={{ opacity: 0, y: 12 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.2, duration: 0.6 }}
						className="mt-8 flex gap-3"
					>
						<Link
							href="/obras"
							className="inline-flex items-center rounded-md px-5 py-2.5 text-sm bg-black text-white dark:bg-white/10 dark:text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/30"
						>
							Ver obras
						</Link>
						<Link
							href="/contacto"
							className="inline-flex items-center rounded-md px-5 py-2.5 text-sm border border-black/15 dark:border-white/20 hover:bg-black/5 dark:hover:bg-white/10"
						>
							Solicitar presupuesto
						</Link>
					</motion.div>
				</div>
			</div>
		</section>
	);
};

export default HeroBanner;
