import type { Variants } from "framer-motion";

export const fadeUp: Variants = {
	hidden: { opacity: 0, y: 24 },
	show: {
		opacity: 1,
		y: 0,
		transition: {
			duration: 0.6,
			ease: [0.22, 1, 0.36, 1] as const, // 👈 tupla, no number[]
		},
	},
};

export const fade: Variants = {
	hidden: { opacity: 0 },
	show: {
		opacity: 1,
		transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
	},
};

export const stagger: Variants = {
	show: {
		transition: { staggerChildren: 0.12 },
	},
};
