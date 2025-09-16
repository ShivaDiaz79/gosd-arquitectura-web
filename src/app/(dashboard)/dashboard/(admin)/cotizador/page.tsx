"use client";

import QuoteForm from "@/components/cotizador/QuoteForm";
import CategoriasAdminForm from "@/components/cotizador/seleccion/CategoriasAdminForm";
import EjecutablesConstruccionAdmin from "@/components/cotizador/seleccion/EjecutablesConstruccionAdmin";
import EjecutablesConstruccionTreeAdmin from "@/components/cotizador/seleccion/EjecutablesContruccionTreeAdmin";
import EntregablesDisenoAdmin from "@/components/cotizador/seleccion/EntregablesDisenoAdmin";
import ServicioOpcionesForm from "@/components/cotizador/seleccion/ServicioOpcionesForm";
import { useEffect, useState } from "react";
import Accordion from "@/components/ui/accordion/Accordion";

type Key =
	| "servicios"
	| "categorias"
	| "entregables"
	| "ejecutables"
	| "cotizador";

export default function CotizadorPage() {
	const [openKey, setOpenKey] = useState<Key | null>("servicios");

	useEffect(() => {
		if (typeof window === "undefined") return;
		const k = window.location.hash.replace("#", "") as Key;
		const valid: Key[] = [
			"servicios",
			"categorias",
			"entregables",
			"ejecutables",
			"cotizador",
		];
		if (valid.includes(k)) setOpenKey(k);
	}, []);

	useEffect(() => {
		if (typeof window === "undefined" || !openKey) return;
		const url = new URL(window.location.href);
		url.hash = openKey;
		window.history.replaceState(null, "", url.toString());
	}, [openKey]);

	return (
		<main className="mx-auto max-w-5xl gap-6 p-6 lg:gap-8">
			<h1 className="mb-6 text-3xl font-bold tracking-tight">
				Administrador y Cotizador de Proyectos
			</h1>

			<div className="space-y-6">
				<Accordion
					id="servicios"
					title="Primera selección (Servicios)"
					openKey={openKey}
					setOpenKey={setOpenKey}
					level={2}
				>
					<p className="mb-4 text-sm text-gray-600">
						Agrega, actualiza o elimina opciones de la primera selección.
					</p>
					<ServicioOpcionesForm />
				</Accordion>

				<Accordion
					id="categorias"
					title="Segunda selección (Categorías)"
					openKey={openKey}
					setOpenKey={setOpenKey}
					level={2}
				>
					<CategoriasAdminForm />
				</Accordion>

				<Accordion
					id="entregables"
					title="Tercera selección (Entregables de diseño)"
					openKey={openKey}
					setOpenKey={setOpenKey}
					level={2}
				>
					<EntregablesDisenoAdmin />
				</Accordion>

				<Accordion
					id="ejecutables"
					title="Cuarta selección (Ejecutables de construcción)"
					openKey={openKey}
					setOpenKey={setOpenKey}
					level={2}
				>
					<EjecutablesConstruccionTreeAdmin />
				</Accordion>

				<Accordion
					id="cotizador"
					title="Herramienta de Cotización Automática"
					openKey={openKey}
					setOpenKey={setOpenKey}
					level={2}
				>
					<QuoteForm />
				</Accordion>
			</div>
		</main>
	);
}
