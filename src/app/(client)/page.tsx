"use client";

import React from "react";
import MarqueeObras from "@/components/home/MarqueeObras";
import Nosotros from "@/components/home/Nosotros";
import Servicios from "@/components/home/Servicios";
import ObrasDestacadas from "@/components/home/ObrasDestacadas";
import Proceso from "@/components/home/Proceso";
import CTA from "@/components/home/CTA";
import ParallaxBand from "@/components/home/ParallaxBand";
import HeroBanner from "@/components/home/HeroBanner";

export default function Home() {
	return (
		<main className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
			<HeroBanner />
			<MarqueeObras />
			<Nosotros />
			<Servicios />
			<ParallaxBand />
			<ObrasDestacadas />
			<Proceso />
			<CTA />
		</main>
	);
}
