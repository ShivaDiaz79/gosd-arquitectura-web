"use client";

import { useCallback, useEffect, useState } from "react";
import { db } from "@/firebase/config";
import { doc, getDoc, setDoc } from "firebase/firestore";
import type { ParallaxContent } from "@/lib/types/parallax.type";

const DOC_PATH = "site/parallax";

const DEFAULTS: ParallaxContent = {
	title: "Proceso y coordinación en obra",
	subtitle:
		"Gestión de contratistas, control de calidad y planificación Last Planner. Avances medibles y trazabilidad de decisiones.",
	bgUrl:
		"https://content.arquitecturaydiseno.es/medio/2017/03/08/apartamentos12_c3121e4b.png",
	bgOpacity: 25,
	videoUrl: "/media/site_walkthrough.mp4",
	posterUrl: "/images/site_walkthrough_poster.jpg",
	parallaxY: 120,
	scaleVideo: 1.06,
};

function normalize(d?: Partial<ParallaxContent>): ParallaxContent {
	const x = { ...DEFAULTS, ...(d || {}) } as ParallaxContent;
	x.bgOpacity = Math.min(100, Math.max(0, Number(x.bgOpacity ?? 25)));
	x.parallaxY = Math.min(400, Math.max(0, Number(x.parallaxY ?? 120)));
	x.scaleVideo = Math.min(1.3, Math.max(1, Number(x.scaleVideo ?? 1.06)));
	return x;
}

export function useParallaxContent() {
	const [data, setData] = useState<ParallaxContent | null>(null);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const load = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const snap = await getDoc(doc(db, DOC_PATH));
			if (snap.exists())
				setData(normalize(snap.data() as Partial<ParallaxContent>));
			else setData(DEFAULTS);
		} catch (e: any) {
			setError(e?.message || "Error cargando sección parallax");
			setData(DEFAULTS);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		load();
	}, [load]);

	const save = useCallback(async (vals: ParallaxContent) => {
		setSaving(true);
		setError(null);
		try {
			const toSave = normalize(vals);
			await setDoc(doc(db, DOC_PATH), toSave, { merge: true });
			setData(toSave);
			return toSave;
		} catch (e: any) {
			setError(e?.message || "Error guardando sección parallax");
			throw e;
		} finally {
			setSaving(false);
		}
	}, []);

	return { data, loading, error, saving, reload: load, save };
}
