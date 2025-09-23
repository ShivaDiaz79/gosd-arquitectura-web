"use client";

import {
	motion,
	useReducedMotion,
	useScroll,
	useTransform,
} from "framer-motion";
import { useRef } from "react";

const ParallaxBand = () => {
	const prefersReduced = useReducedMotion();
	const ref = useRef<HTMLDivElement>(null);

	const { scrollYProgress } = useScroll({
		target: ref,

		offset: ["start 85%", "end 15%"],
	});

	const yBg = useTransform(
		scrollYProgress,
		[0, 1],
		[0, prefersReduced ? 0 : 120]
	);
	const scaleVideo = useTransform(
		scrollYProgress,
		[0, 1],
		[1, prefersReduced ? 1 : 1.06]
	);

	return (
		<section
			ref={ref}
			className="relative min-h-[70vh] md:min-h-[80vh] py-16 md:py-20 overflow-hidden"
		>
			<motion.img
				aria-hidden
				src="https://content.arquitecturaydiseno.es/medio/2017/03/08/apartamentos12_c3121e4b.png"
				alt=""
				className="absolute inset-0 w-full h-full object-cover opacity-25"
				style={{ y: yBg, willChange: "transform" }}
			/>

			<div className="relative mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
				<div className="grid md:grid-cols-2 gap-8 items-center">
					<div>
						<h3 className="text-2xl md:text-3xl font-semibold">
							Proceso y coordinación en obra
						</h3>
						<p className="mt-3 text-black/70 dark:text-white/70">
							Gestión de contratistas, control de calidad y planificación Last
							Planner. Avances medibles y trazabilidad de decisiones.
						</p>
					</div>

					<motion.div
						style={{ scale: scaleVideo, willChange: "transform" }}
						className="rounded-2xl overflow-hidden border border-black/10 dark:border-white/10"
					>
						<video
							src="/media/site_walkthrough.mp4"
							autoPlay
							muted
							loop
							playsInline
							className="w-full h-full object-cover"
							poster="/images/site_walkthrough_poster.jpg"
						/>
					</motion.div>
				</div>
			</div>
		</section>
	);
};

export default ParallaxBand;
