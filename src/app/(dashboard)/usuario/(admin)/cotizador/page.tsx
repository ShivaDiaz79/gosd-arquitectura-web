"use client";

import QuoteForm from "@/components/cotizador/QuoteForm";

export default function CotizadorPage() {
	return (
		<main className="mx-auto max-w-4xl p-6">
			<h1 className="mb-6 text-2xl font-semibold">
				Herramienta de Cotización Automática
			</h1>
			<QuoteForm />
		</main>
	);
}
