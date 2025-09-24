// app/proyectos/page.tsx
"use client";

import SectionHeader from "@/components/proyectos/SectionHeader";
import ProjectCarousel from "@/components/proyectos/ProjectCarousel";
import ProjectStrip from "@/components/proyectos/ProjectStrip";

export default function Page() {
	const img1 =
		"https://content.arquitecturaydiseno.es/medio/2017/03/08/apartamentos12_c3121e4b.png";

	return (
		<>
			<SectionHeader
				eyebrow="GOSD Construccion"
				title="Proyectos de arquitectura."
				intro="Conocé nuestros últimos proyectos de diseño y construcción de casas. Nuestros proyectos reflejan vivencias, necesidades y gustos del propietario."
				linkText="Hablemos de tu hogar"
				onLinkClick={() => {
					const el = document.getElementById("contacto");
					el?.scrollIntoView({ behavior: "smooth", block: "start" });
				}}
			/>

			<ProjectCarousel
				name="Casa Cinta"
				location="Barrio Hudson Park"
				images={[img1, img1, img1]}
				aspectRatio="16 / 9"
				speed={70}
				gapClass="gap-4 md:gap-6"
				showArrows
				showDots
			/>

			<ProjectCarousel
				name="Casa Mediterránea"
				location="Barrio Fincas de Hudson"
				images={[img1, img1, img1]}
				aspectRatio="16 / 9"
				speed={70}
				gapClass="gap-4 md:gap-6"
				showArrows
				showDots
			/>

			<ProjectStrip
				items={[
					{
						id: 1,
						title: "Casa Arq",
						subtitle: "Hudson Park",
						cover: "/proyectos/casa-arq/cover.jpg",
					},
					{
						id: 2,
						title: "Casa Patio",
						subtitle: "Saint Thomas",
						cover: "/proyectos/casa-patio/cover.jpg",
					},
					{
						id: 3,
						title: "Casa Bosque",
						subtitle: "Laguna del Sol",
						cover: "/proyectos/casa-bosque/cover.jpg",
					},
				]}
			/>

			<div id="contacto" className="py-24" />
		</>
	);
}
