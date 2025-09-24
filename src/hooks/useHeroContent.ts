"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { db, storage } from "@/firebase/config";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import type { HeroContent } from "@/lib/types/hero.type";

const DOC_PATH = "site/hero";

const DEFAULTS: HeroContent = {
	title: "GOSD CONSTRUCTOR",
	subtitle:
		"Diseño, permisos y ejecución llave en mano. Precisión BIM y control de costos, plazos y calidad.",
	bgUrl:
		"https://content.arquitecturaydiseno.es/medio/2017/03/08/apartamentos12_c3121e4b.png",
	primaryText: "Ver obras",
	primaryHref: "/obras",
	secondaryText: "Solicitar presupuesto",
	secondaryHref: "/contacto",
	overlayMode: "dark",
	overlayOpacity: "45" as any,
};

function normalize(data: Partial<HeroContent> | undefined): HeroContent {
	const d = { ...DEFAULTS, ...(data || {}) } as HeroContent;

	if (!["10", "20", "30", "40", "50"].includes(d.overlayOpacity))
		d.overlayOpacity = "40";
	if (!["light", "dark"].includes(d.overlayMode)) d.overlayMode = "dark";
	return d;
}

export function useHeroContent() {
	const [data, setData] = useState<HeroContent | null>(null);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const load = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const snap = await getDoc(doc(db, DOC_PATH));
			if (snap.exists())
				setData(normalize(snap.data() as Partial<HeroContent>));
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

	const save = useCallback(
		async (values: HeroContent & { bgFile?: File | null }) => {
			setSaving(true);
			setError(null);
			try {
				let bgUrl = values.bgUrl;

				if (values.bgFile instanceof File) {
					const fileRef = ref(storage, `hero/hero-bg-${Date.now()}.jpg`);
					await uploadBytes(fileRef, values.bgFile);
					bgUrl = await getDownloadURL(fileRef);
				}

				const toSave: HeroContent = {
					title: values.title,
					subtitle: values.subtitle,
					bgUrl,
					primaryText: values.primaryText,
					primaryHref: values.primaryHref,
					secondaryText: values.secondaryText || "",
					secondaryHref: values.secondaryHref || "",
					overlayMode: values.overlayMode,
					overlayOpacity: values.overlayOpacity,
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
		},
		[]
	);

	return { data, loading, error, saving, reload: load, save };
}
