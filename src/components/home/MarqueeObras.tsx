"use client";

import {
	motion,
	useReducedMotion,
	useScroll,
	useTransform,
} from "framer-motion";
import Link from "next/link";
import { useRef } from "react";

const items = [
	{
		title: "Casa Ladera",
		tag: "Residencial",
		href: "/obras/residenciales/casa-ladera",
		img: "https://content.arquitecturaydiseno.es/medio/2017/03/08/apartamentos12_c3121e4b.png",
	},
	{
		title: "Galería Norte",
		tag: "Institucional",
		href: "/obras/institucionales/galeria-norte",
		img: "https://content.arquitecturaydiseno.es/medio/2017/03/08/apartamentos12_c3121e4b.png",
	},
	{
		title: "Oficinas Prisma",
		tag: "Comercial",
		href: "/obras/comerciales/oficinas-prisma",
		img: "https://content.arquitecturaydiseno.es/medio/2017/03/08/apartamentos12_c3121e4b.png",
	},
	{
		title: "Parque Delta",
		tag: "Espacio público",
		href: "/obras/espacio-publico/parque-delta",
		img: "https://content.arquitecturaydiseno.es/medio/2017/03/08/apartamentos12_c3121e4b.png",
	},
];

const Row = ({ reverse }: { reverse?: boolean }) => {
	return (
		<div className="group overflow-hidden">
			<motion.div
				aria-hidden
				initial={{ x: reverse ? "-50%" : "0%" }}
				animate={{ x: reverse ? "0%" : "-50%" }}
				transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
				className="flex gap-4"
			>
				{[...items, ...items].map((o, i) => (
					<Link
						key={`${o.title}-${i}`}
						href={o.href}
						className="relative w-[300px] sm:w-[360px] aspect-[4/3] rounded-lg overflow-hidden border border-black/10 dark:border-white/10"
					>
						<img
							src={o.img}
							alt={`${o.title} — GOSD CONSTRUCTOR`}
							className="w-full h-full object-cover"
						/>
						<div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/50 to-transparent text-white">
							<div className="text-xs opacity-80">{o.tag}</div>
							<div className="text-sm font-medium">{o.title}</div>
						</div>
					</Link>
				))}
			</motion.div>
		</div>
	);
};

const MarqueeObras = () => {
	const prefersReduced = useReducedMotion();
	const ref = useRef<HTMLDivElement>(null);
	const { scrollYProgress } = useScroll({
		target: ref,
		offset: ["start end", "end start"],
	});
	const y = useTransform(
		scrollYProgress,
		[0, 1],
		[0, prefersReduced ? 0 : -30]
	);

	return (
		<section
			ref={ref}
			className="py-12 md:py-16 border-b border-black/10 dark:border-white/10"
		>
			<div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
				<div className="flex items-end justify-between">
					<h2 className="text-xl md:text-2xl font-semibold">
						Explora algunas obras
					</h2>
					<Link href="/obras" className="text-sm underline underline-offset-4">
						Ver portafolio
					</Link>
				</div>
			</div>

			<motion.div style={{ y }} className="mt-6 space-y-4">
				<Row />
				<Row reverse />
			</motion.div>
		</section>
	);
};

export default MarqueeObras;
