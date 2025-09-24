"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { fadeUp, stagger } from "@/lib/motion";

type Item = {
	id: string | number;
	title: string;
	subtitle?: string;
	cover: string;
};

export default function ProjectStrip({ items }: { items: Item[] }) {
	return (
		<section className="py-12 md:py-16">
			<div className="container mx-auto px-4">
				<motion.div
					initial="hidden"
					whileInView="show"
					viewport={{ once: true, amount: 0.25 }}
					variants={stagger}
					className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
				>
					{items.map((it) => (
						<motion.article key={it.id} variants={fadeUp} className="group">
							<div className="relative aspect-[16/11] overflow-hidden rounded-none">
								<Image
									src={it.cover}
									alt={it.title}
									fill
									sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
									className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
								/>
							</div>
							<div className="mt-3">
								<h4 className="font-medium text-lg">{it.title}</h4>
								{it.subtitle && (
									<p className="text-neutral-500">{it.subtitle}</p>
								)}
							</div>
						</motion.article>
					))}
				</motion.div>
			</div>
		</section>
	);
}
