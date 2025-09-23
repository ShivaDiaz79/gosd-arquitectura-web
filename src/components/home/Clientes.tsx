"use client";

import { motion } from "framer-motion";
import { stagger, scaleIn } from "./MotionUtils";

const marcas = ["Andes", "Prisma", "Forma", "Norte", "Atlas", "Terra"];

const Clientes = () => {
	return (
		<section className="py-16 md:py-24 border-t border-black/10 dark:border-white/10">
			<div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
				<h2 className="text-2xl md:text-3xl font-semibold">Clientes</h2>
				<motion.ul
					variants={stagger(0.12)}
					initial="hidden"
					whileInView="show"
					viewport={{ once: true, margin: "-80px" }}
					className="mt-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-5"
				>
					{marcas.map((m) => (
						<motion.li
							key={m}
							variants={scaleIn}
							className="h-16 rounded-lg border border-black/10 dark:border-white/10 flex items-center justify-center text-sm opacity-80"
							aria-label={`Cliente ${m}`}
						>
							{m}
						</motion.li>
					))}
				</motion.ul>
			</div>
		</section>
	);
};

export default Clientes;
