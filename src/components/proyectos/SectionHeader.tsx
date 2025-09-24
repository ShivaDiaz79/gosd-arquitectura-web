"use client";

import { motion } from "framer-motion";
import { fadeUp, fade } from "@/lib/motion";

type Props = {
	eyebrow?: string;
	title: string;
	intro?: string;
	linkText?: string;
	onLinkClick?: () => void;
};

export default function SectionHeader({
	eyebrow,
	title,
	intro,
	linkText,
	onLinkClick,
}: Props) {
	return (
		<section className="py-16 md:py-24">
			<div className="container mx-auto px-4">
				<div className="grid md:grid-cols-12 gap-10 items-start">
					<motion.div
						initial="hidden"
						whileInView="show"
						viewport={{ once: true, amount: 0.4 }}
						className="md:col-span-7"
					>
						{eyebrow && (
							<motion.p
								variants={fade}
								className="text-sm tracking-[0.2em] uppercase text-neutral-500 mb-4"
							>
								{eyebrow}
							</motion.p>
						)}
						<motion.h1
							variants={fadeUp}
							className="text-[clamp(2rem,5vw,4rem)] leading-[1.05] font-semibold"
						>
							{title}
						</motion.h1>
					</motion.div>

					<motion.div
						initial="hidden"
						whileInView="show"
						viewport={{ once: true, amount: 0.4 }}
						className="md:col-span-5 md:pl-8"
					>
						<motion.p
							variants={fadeUp}
							className="text-neutral-600 text-lg leading-7"
						>
							{intro}
						</motion.p>
						{linkText && (
							<motion.button
								variants={fadeUp}
								onClick={onLinkClick}
								className="mt-4 inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-800"
							>
								<span className="inline-block h-2 w-2 rounded-full bg-rose-500"></span>
								{linkText}
							</motion.button>
						)}
					</motion.div>
				</div>
			</div>
		</section>
	);
}
