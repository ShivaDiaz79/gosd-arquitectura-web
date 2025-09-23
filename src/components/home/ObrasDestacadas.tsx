"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { stagger, flyUp } from "./MotionUtils";

const obras = [
	{
		title: "Casa Ladera",
		tag: "Residencial",
		href: "/obras/residenciales/casa-ladera",
		cover: "/images/obras/casa-ladera.jpg",
	},
	{
		title: "Galería Norte",
		tag: "Institucional",
		href: "/obras/institucionales/galeria-norte",
		cover: "/images/obras/galeria-norte.jpg",
	},
	{
		title: "Oficinas Prisma",
		tag: "Comercial",
		href: "/obras/comerciales/oficinas-prisma",
		cover: "/images/obras/oficinas-prisma.jpg",
	},
];

const ObrasDestacadas = () => {
	return (
		<section className="py-16 md:py-24 border-t border-black/10 dark:border-white/10">
			<div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
				<div className="flex items-end justify-between gap-4">
					<h2 className="text-2xl md:text-3xl font-semibold">
						Obras destacadas
					</h2>
					<Link
						href="/obras"
						className="text-sm underline underline-offset-4 hover:opacity-80"
					>
						Ver portafolio
					</Link>
				</div>

				<motion.div
					variants={stagger(0.12)}
					initial="hidden"
					whileInView="show"
					viewport={{ once: true, margin: "-80px" }}
					className="mt-10 grid md:grid-cols-3 gap-6"
				>
					{obras.map((o) => (
						<motion.article
							key={o.title}
							variants={flyUp}
							className="group rounded-lg overflow-hidden border border-black/10 dark:border-white/10"
						>
							<Link href={o.href} className="block">
								<div className="relative aspect-[4/3] overflow-hidden">
									<Image
										src={o.cover}
										alt={`${o.title} — GOSD CONSTRUCTOR`}
										fill
										className="object-cover transition-transform duration-[900ms] group-hover:scale-105"
										sizes="(min-width: 1024px) 33vw, 100vw"
									/>
									<div className="pointer-events-none absolute inset-0 ring-0 group-hover:ring-2 ring-inset ring-black/10 dark:ring-white/20 transition-all duration-700" />
								</div>
								<div className="p-4">
									<div className="text-xs uppercase tracking-wide opacity-70">
										{o.tag}
									</div>
									<h3 className="mt-1 font-medium">{o.title}</h3>
								</div>
							</Link>
						</motion.article>
					))}
				</motion.div>
			</div>
		</section>
	);
};

export default ObrasDestacadas;
