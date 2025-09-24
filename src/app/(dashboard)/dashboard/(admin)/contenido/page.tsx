"use client";

import { useState } from "react";
import AccordionItem from "@/components/ui/accordion/Accordion";
import HeroForm from "@/components/home/HeroForm";
import AboutForm from "@/components/home/AboutForm";
import ServicesForm from "@/components/home/ServicesForm";
import ParallaxBandForm from "@/components/home/ParallaxBandForm";
import ProcesoForm from "@/components/home/ProcesoForm";

export default function Page() {
	const [openKey, setOpenKey] = useState<string | null>("hero");

	return (
		<div className="space-y-4">
			<AccordionItem
				id="hero"
				title="Sección: Hero"
				openKey={openKey}
				setOpenKey={setOpenKey}
			>
				<HeroForm />
			</AccordionItem>

			<AccordionItem
				id="about"
				title="Sección: Sobre nosotros"
				openKey={openKey}
				setOpenKey={setOpenKey}
			>
				<AboutForm />
			</AccordionItem>

			<AccordionItem
				id="services"
				title="Sección: Servicios"
				openKey={openKey}
				setOpenKey={setOpenKey}
			>
				<ServicesForm />
			</AccordionItem>

			<AccordionItem
				id="parallax"
				title="Sección: Banda Parallax"
				openKey={openKey}
				setOpenKey={setOpenKey}
			>
				<ParallaxBandForm />
			</AccordionItem>
			<AccordionItem
				id="proceso"
				title="Sección: Proceso"
				openKey={openKey}
				setOpenKey={setOpenKey}
			>
				<ProcesoForm />
			</AccordionItem>
		</div>
	);
}
