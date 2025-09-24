"use client";

import { useCallback, useEffect, useState } from "react";
import { db } from "@/firebase/config";
import { doc, getDoc, setDoc } from "firebase/firestore";
import type { ProcesoContent, ProcesoPaso } from "@/lib/types/proceso.type";

const DOC_PATH = "site/proceso";

const DEFAULTS: ProcesoContent = {
	title: "Proceso",
	steps: [
		{ n: "01", t: "Análisis", d: "Programa, contexto y viabilidad." },
		{ n: "02", t: "Diseño", d: "Iteraciones y definición conceptual." },
		{ n: "03", t: "Proyecto ejecutivo", d: "Detalles, especialidades y BIM." },
		{ n: "04", t: "Permisos", d: "Gestión normativa y compatibilidades." },
		{
			n: "05",
			t: "Construcción",
			d: "Dirección de obra y control de calidad.",
		},
		{ n: "06", t: "Entrega", d: "Puesta en marcha y documentos as-built." },
	],
};

function normalize(data?: Partial<ProcesoContent>): ProcesoContent {
	const d = { ...DEFAULTS, ...(data || {}) } as ProcesoContent;
	d.title = d.title?.trim() || "Proceso";
	d.steps = Array.isArray(d.steps) ? d.steps : DEFAULTS.steps;

	d.steps = d.steps.map((s, i) => ({
		n: (s.n ?? String(i + 1).padStart(2, "0")).toString(),
		t: (s.t ?? "").toString(),
		d: (s.d ?? "").toString(),
	}));
	return d;
}

export function useProcesoContent() {
	const [data, setData] = useState<ProcesoContent | null>(null);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const load = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const snap = await getDoc(doc(db, DOC_PATH));
			if (snap.exists())
				setData(normalize(snap.data() as Partial<ProcesoContent>));
			else setData(DEFAULTS);
		} catch (e: any) {
			setError(e?.message || "Error cargando Proceso");
			setData(DEFAULTS);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		load();
	}, [load]);

	const save = useCallback(async (values: ProcesoContent) => {
		setSaving(true);
		setError(null);
		try {
			const toSave: ProcesoContent = {
				title: values.title.trim() || "Proceso",
				steps: values.steps.map((s, i) => ({
					n: (s.n || String(i + 1).toString()).toString(),
					t: (s.t || "").toString(),
					d: (s.d || "").toString(),
				})),
			};
			await setDoc(doc(db, DOC_PATH), toSave, { merge: true });
			setData(toSave);
			return toSave;
		} catch (e: any) {
			setError(e?.message || "Error guardando Proceso");
			throw e;
		} finally {
			setSaving(false);
		}
	}, []);

	return { data, loading, saving, error, reload: load, save };
}
