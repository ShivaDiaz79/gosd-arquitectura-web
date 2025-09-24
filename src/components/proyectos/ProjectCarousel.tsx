"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useAnimation, useMotionValue } from "framer-motion";
import type { MotionValue } from "framer-motion";

type Props = {
	name: string;

	location?: string;

	images: string[];

	aspectRatio?: string;

	speed?: number;

	gapClass?: string;

	showArrows?: boolean;

	showDots?: boolean;
};

const DEFAULT_RATIO = "16 / 9";
const DRAG_ELASTIC = 0.15;

export default function ProjectCarousel({
	name,
	location,
	images,
	aspectRatio = DEFAULT_RATIO,
	speed = 60,
	gapClass = "gap-4 md:gap-6",
	showArrows = true,
	showDots = true,
}: Props) {
	const containerRef = useRef<HTMLDivElement | null>(null);
	const trackRef = useRef<HTMLDivElement | null>(null);
	const [isHovering, setIsHovering] = useState(false);
	const [isDragging, setIsDragging] = useState(false);
	const [containerW, setContainerW] = useState(0);
	const [trackW, setTrackW] = useState(0);

	const x = useMotionValue<number>(0);
	const controls = useAnimation();

	const imgs = useMemo(() => (images?.length ? images : [""]), [images]);

	const loopImages = useMemo(() => [...imgs, ...imgs], [imgs]);

	useEffect(() => {
		const measure = () => {
			const c = containerRef.current;
			const t = trackRef.current;
			if (!c || !t) return;
			setContainerW(c.clientWidth);
			setTrackW(t.scrollWidth / 2);
		};
		measure();
		const ro = new ResizeObserver(measure);
		if (containerRef.current) ro.observe(containerRef.current);
		return () => ro.disconnect();
	}, [loopImages.length]);

	useEffect(() => {
		let raf = 0;
		let last = performance.now();

		const tick = (now: number) => {
			const dt = (now - last) / 1000;
			last = now;

			const shouldMove = !isHovering && !isDragging && trackW > 0;
			if (shouldMove) {
				const delta = -speed * dt;
				let next = x.get() + delta;

				if (next <= -trackW) next += trackW;
				x.set(next);
			}
			raf = requestAnimationFrame(tick);
		};

		raf = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(raf);
	}, [isHovering, isDragging, speed, trackW, x]);

	const jump = (dir: number) => {
		if (!trackW) return;
		const step = Math.min(containerW * 0.8, trackW / Math.min(imgs.length, 3));
		const target = x.get() - dir * step;
		controls.start({
			x: target,
			transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
		});
	};

	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "ArrowRight") jump(1);
			if (e.key === "ArrowLeft") jump(-1);
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [trackW, containerW, imgs.length]);

	const onDragEnd = (_: any, info: { offset: { x: number } }) => {
		setIsDragging(false);
		if (!trackW) return;
		let current = x.get();

		while (current <= -trackW) current += trackW;
		while (current > 0) current -= trackW;

		const target = current + info.offset.x;
		controls.start({ x: target, transition: { duration: 0.35 } });
	};

	return (
		<section className="py-8 md:py-12" aria-label={name}>
			<div className="container mx-auto px-4">
				<div className="mb-4 md:mb-6 flex items-center gap-3">
					<h3 className="text-2xl font-semibold">{name}</h3>
					{location && <span className="text-neutral-500">{location}</span>}
				</div>

				<div
					className="relative"
					role="region"
					aria-roledescription="carousel"
					aria-label={`${name} - carrusel de imágenes`}
					onMouseEnter={() => setIsHovering(true)}
					onMouseLeave={() => setIsHovering(false)}
					onTouchStart={() => setIsHovering(true)}
					onTouchEnd={() => setIsHovering(false)}
				>
					{showArrows && (
						<>
							<button
								aria-label="Anterior"
								onClick={() => jump(-1)}
								className="absolute left-0 top-1/2 -translate-y-1/2 z-20 rounded-full bg-white/90 shadow hover:bg-white px-2 py-2"
							>
								‹
							</button>
							<button
								aria-label="Siguiente"
								onClick={() => jump(1)}
								className="absolute right-0 top-1/2 -translate-y-1/2 z-20 rounded-full bg-white/90 shadow hover:bg-white px-2 py-2"
							>
								›
							</button>
						</>
					)}

					<div ref={containerRef} className="overflow-hidden">
						<motion.div
							ref={trackRef}
							className={`flex ${gapClass} items-stretch`}
							style={{ x }}
							animate={controls}
							drag="x"
							dragConstraints={{ left: -Infinity, right: Infinity }}
							dragElastic={DRAG_ELASTIC}
							onDragStart={() => setIsDragging(true)}
							onDragEnd={onDragEnd}
						>
							{loopImages.map((src, i) => (
								<div
									key={i}
									className="shrink-0"
									style={{
										aspectRatio: aspectRatio,
										width: "min(80vw, 720px)",
									}}
								>
									<div className="h-full w-full overflow-hidden rounded-lg bg-neutral-200">
										<img
											src={src}
											alt={`Imagen ${((i % imgs.length) + 1)
												.toString()
												.padStart(2, "0")}`}
											className="h-full w-full object-cover"
											loading="lazy"
											draggable={false}
										/>
									</div>
								</div>
							))}
						</motion.div>
					</div>

					{showDots && imgs.length > 1 && (
						<Dots
							count={imgs.length}
							x={x}
							width={containerW}
							gapPx={getGapPxFromClass(gapClass)}
							itemW={Math.min(Math.max(containerW * 0.8, 240), 720)}
						/>
					)}
				</div>
			</div>
		</section>
	);
}

function Dots({
	count,
	x,
	width,
	gapPx,
	itemW,
}: {
	count: number;
	x: MotionValue<number>;
	width: number;
	gapPx: number;
	itemW: number;
}) {
	const [idx, setIdx] = useState(0);

	useEffect(() => {
		const unsub = x.on("change", (val) => {
			const step = itemW + gapPx;
			const pos = Math.abs(val) % (count * step);
			const i = Math.round(pos / step) % count;
			setIdx(i);
		});
		return () => unsub();
	}, [x, count, gapPx, itemW]);

	return (
		<div className="mt-6 flex items-center justify-center gap-2">
			{Array.from({ length: count }).map((_, i) => (
				<span
					key={i}
					aria-hidden
					className={`h-2.5 w-2.5 rounded-full transition ${
						i === idx ? "bg-neutral-900" : "bg-neutral-300"
					}`}
				/>
			))}
		</div>
	);
}

function getGapPxFromClass(gapClass: string) {
	const map: Record<string, number> = {
		"gap-2": 8,
		"gap-3": 12,
		"gap-4": 16,
		"gap-5": 20,
		"gap-6": 24,
		"gap-8": 32,
	};
	for (const key of Object.keys(map))
		if (gapClass.includes(key)) return map[key];
	return 16;
}
