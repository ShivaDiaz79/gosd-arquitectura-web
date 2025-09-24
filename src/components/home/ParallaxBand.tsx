"use client";

import {
	motion,
	useReducedMotion,
	useScroll,
	useTransform,
} from "framer-motion";
import { useRef, useMemo } from "react";
import { useParallaxContent } from "@/hooks/useParallaxContent";

const ParallaxBand = () => {
	const { data, loading } = useParallaxContent();

	const prefersReduced = useReducedMotion();
	const ref = useRef<HTMLDivElement>(null);

	const parallaxY = useMemo(
		() => (prefersReduced ? 0 : data?.parallaxY ?? 120),
		[prefersReduced, data?.parallaxY]
	);
	const scaleTo = useMemo(
		() => (prefersReduced ? 1 : data?.scaleVideo ?? 1.06),
		[prefersReduced, data?.scaleVideo]
	);

	const { scrollYProgress } = useScroll({
		target: ref,
		offset: ["start 85%", "end 15%"],
	});

	const yBg = useTransform(scrollYProgress, [0, 1], [0, parallaxY]);
	const scaleVideo = useTransform(scrollYProgress, [0, 1], [1, scaleTo]);

	const bgOpacityClass = `opacity-${
		Math.round((data?.bgOpacity ?? 25) / 5) * 5
	}`;

	return (
		<section
			ref={ref}
			className="relative min-h-[64vh] sm:min-h-[70vh] md:min-h-[80vh] py-12 sm:py-16 md:py-20 overflow-hidden"
		>
			<motion.img
				aria-hidden
				src={data?.bgUrl}
				alt=""
				className={`absolute inset-0 w-full h-full object-cover ${bgOpacityClass}`}
				style={{ y: yBg, willChange: "transform" }}
			/>

			<div className="relative mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
				<div className="grid lg:grid-cols-2 gap-6 sm:gap-8 items-center">
					<div>
						<h3 className="text-2xl sm:text-3xl md:text-4xl font-semibold">
							{loading ? "Cargando…" : data?.title}
						</h3>
						<p className="mt-3 sm:mt-4 text-black/75 dark:text-white/75 text-base sm:text-lg leading-relaxed">
							{loading ? "" : data?.subtitle}
						</p>
					</div>

					<motion.div
						style={{ scale: scaleVideo, willChange: "transform" }}
						className="rounded-2xl overflow-hidden border border-black/10 dark:border-white/10"
					>
						<video
							src={data?.videoUrl}
							autoPlay
							muted
							loop
							playsInline
							className="w-full h-full object-cover"
							poster={data?.posterUrl}
						/>
					</motion.div>
				</div>
			</div>
		</section>
	);
};

export default ParallaxBand;
