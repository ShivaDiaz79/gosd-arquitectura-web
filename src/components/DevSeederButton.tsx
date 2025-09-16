"use client";
import { useState } from "react";
import { CotizadorService } from "@/services/CotizadorService";

export default function DevSeederButton() {
	const [busy, setBusy] = useState(false);
	const [ok, setOk] = useState<null | string>(null);

	const run = async () => {
		setBusy(true);
		setOk(null);
		try {
			await CotizadorService.seedDefaults();
			setOk("Seed ejecutado ✅");
		} catch (e: any) {
			setOk("Error: " + (e?.message ?? "desconocido"));
		} finally {
			setBusy(false);
		}
	};

	return (
		<button
			type="button"
			onClick={run}
			className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
			disabled={busy}
			title="Sembrar Firestore con valores por defecto"
		>
			{busy ? "Sembrando..." : "Seeder: cargar defaults"}
			{ok && <span className="ml-2 text-xs text-gray-500">{ok}</span>}
		</button>
	);
}
