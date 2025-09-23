"use client";
import { Variants } from "framer-motion";

export const flyUp: Variants = {
	hidden: { y: 22, opacity: 0 },
	show: {
		y: 0,
		opacity: 1,
		transition: { type: "spring", stiffness: 140, damping: 26, mass: 0.9 },
	},
};

export const fadeIn: Variants = {
	hidden: { opacity: 0 },
	show: { opacity: 1, transition: { duration: 0.7, ease: "easeOut" } },
};

export const stagger = (delay = 0.12) => ({
	hidden: {},
	show: {
		transition: { staggerChildren: delay, delayChildren: delay },
	},
});

export const scaleIn: Variants = {
	hidden: { opacity: 0, scale: 0.96 },
	show: {
		opacity: 1,
		scale: 1,
		transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
	},
};
