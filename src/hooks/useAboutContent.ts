"use client";

import { useCallback, useEffect, useState } from "react";
import { db } from "@/firebase/config";
import { doc, getDoc, setDoc } from "firebase/firestore";
import type { AboutContent } from "@/lib/types/nosotros.type";

const DOC_PATH = "site/about";

const DEFAULTS: AboutContent = {
	title: "Nosotros",
	intro:
		"En GOSD CONSTRUCTOR integramos arquitectura, ingeniería y obra. Trabajamos con coordinación BIM, planificación de obra y estándares de calidad para entregar proyectos sin sorpresas.",
	stats: [
		{ k: "+12", v: "años construyendo" },
		{ k: "BIM", v: "coordinación integral" },
		{ k: "QHSE", v: "seguridad y calidad" },
		{ k: "On-time", v: "compromiso de plazos" },
	],
};

function normalize(d: Partial<AboutContent> | undefined): AboutContent {
	const data = { ...DEFAULTS, ...(d || {}) } as AboutContent;

	if (!Array.isArray(data.stats)) data.stats = DEFAULTS.stats;
	data.stats = data.stats
		.filter((s) => s && typeof s.k === "string" && typeof s.v === "string")
		.slice(0, 8);
	if (data.stats.length === 0) data.stats = DEFAULTS.stats;
	return data;
}

export function useAboutContent() {
	const [data, setData] = useState<AboutContent | null>(null);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const load = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const snap = await getDoc(doc(db, DOC_PATH));
			if (snap.exists())
				setData(normalize(snap.data() as Partial<AboutContent>));
			else setData(DEFAULTS);
		} catch (e: any) {
			setError(e?.message || "Error cargando contenido");
			setData(DEFAULTS);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		load();
	}, [load]);

	const save = useCallback(async (values: AboutContent) => {
		setSaving(true);
		setError(null);
		try {
			const toSave: AboutContent = {
				title: values.title.trim() || DEFAULTS.title,
				intro: values.intro.trim() || DEFAULTS.intro,
				stats: (values.stats || []).map((s) => ({
					k: String(s.k || "").trim(),
					v: String(s.v || "").trim(),
				})),
			};
			await setDoc(doc(db, DOC_PATH), toSave, { merge: true });
			setData(toSave);
			return toSave;
		} catch (e: any) {
			setError(e?.message || "Error guardando contenido");
			throw e;
		} finally {
			setSaving(false);
		}
	}, []);

	return { data, loading, error, saving, reload: load, save };
}
