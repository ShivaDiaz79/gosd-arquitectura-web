"use client";

import { useCallback, useEffect, useState } from "react";
import { db } from "@/firebase/config";
import { doc, getDoc, setDoc } from "firebase/firestore";
import type { ServicesContent, ServiceItem } from "@/lib/types/services.type";

const DOC_PATH = "site/services";

const DEFAULTS: ServicesContent = {
	heading: "Servicios",
	ctaText: "Ver todos",
	ctaHref: "/servicios",
	items: [
		{
			title: "Diseño y arquitectura",
			desc: "Anteproyecto, ejecutivo y coordinación BIM.",
			href: "/servicios/diseno-arquitectonico",
		},
		{
			title: "Ejecución de obra",
			desc: "Construcción llave en mano, control de calidad y costos.",
			href: "/servicios/construccion",
		},
		{
			title: "Dirección y gerencia de proyectos",
			desc: "Planificación, cronogramas y supervisión técnica.",
			href: "/servicios/direccion-de-obra",
		},
		{
			title: "Gestión de permisos",
			desc: "Tramitología municipal, compatibilidades y normativas.",
			href: "/servicios/gestion-de-permisos",
		},
	],
};

function normalize(d: Partial<ServicesContent> | undefined): ServicesContent {
	const data = { ...DEFAULTS, ...(d || {}) } as ServicesContent;
	if (!Array.isArray(data.items)) data.items = DEFAULTS.items;
	data.items = data.items
		.map((it) => {
			if (!it || typeof it !== "object") return null;
			const title = String((it as any).title ?? "").trim();
			const desc = String((it as any).desc ?? "").trim();
			const href = String((it as any).href ?? "").trim() || "#";
			if (!title) return null;
			return { title, desc, href } as ServiceItem;
		})
		.filter(Boolean) as ServiceItem[];

	if (data.items.length === 0) data.items = DEFAULTS.items;

	data.items = data.items.slice(0, 12);
	return data;
}

export function useServicesContent() {
	const [data, setData] = useState<ServicesContent | null>(null);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const load = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const snap = await getDoc(doc(db, DOC_PATH));
			if (snap.exists())
				setData(normalize(snap.data() as Partial<ServicesContent>));
			else setData(DEFAULTS);
		} catch (e: any) {
			setError(e?.message || "Error cargando servicios");
			setData(DEFAULTS);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		load();
	}, [load]);

	const save = useCallback(async (values: ServicesContent) => {
		setSaving(true);
		setError(null);
		try {
			const toSave: ServicesContent = normalize(values);
			await setDoc(doc(db, DOC_PATH), toSave, { merge: true });
			setData(toSave);
			return toSave;
		} catch (e: any) {
			setError(e?.message || "Error guardando servicios");
			throw e;
		} finally {
			setSaving(false);
		}
	}, []);

	return { data, loading, error, saving, reload: load, save };
}
