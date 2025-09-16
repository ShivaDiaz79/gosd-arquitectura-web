import {
	addDoc,
	collection,
	doc,
	getDoc,
	getDocs,
	limit,
	orderBy,
	query,
	serverTimestamp,
	updateDoc,
	where,
	Timestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export type FormValues = {
	servicio: "diseno" | "construccion" | "diseno_construccion" | "";
	categoria_l1?: string;
	categoria_l2?: string;
	categoria_l3?: string;
	superficie_m2?: number | string;
	todo_diseno?: boolean;
	entregables?: string[];
	todo_construccion?: boolean;
	ejecutables?: string[];
	adjunto?: File | null;
	otros_descripcion?: string;
};

export type CotizadorConfig = {
	SERVICIO_OPCIONES: { value: string; label: string }[];
	CATEGORIA_L1: { value: string; label: string }[];
	CATEGORIA_L2: Record<string, { value: string; label: string }[]>;
	CATEGORIA_L3: Record<string, { value: string; label: string }[]>;
	ENTREGABLES_DISENO: { value: string; text: string }[];
	EJECUTABLES_CONSTRUCCION: { value: string; text: string }[];
	COSTOS_M2: Record<string, { diseno?: number; construccion?: number }>;
	TARIFAS_ENTREGABLES_M2: Record<string, number>;
	TARIFAS_EJECUTABLES_M2: Record<string, number>;
};

import {
	SERVICIO_OPCIONES as LOCAL_SERVICIO_OPCIONES,
	CATEGORIA_L1 as LOCAL_CATEGORIA_L1,
	CATEGORIA_L2 as LOCAL_CATEGORIA_L2,
	CATEGORIA_L3 as LOCAL_CATEGORIA_L3,
	ENTREGABLES_DISENO as LOCAL_ENTREGABLES_DISENO,
	EJECUTABLES_CONSTRUCCION as LOCAL_EJECUTABLES_CONSTRUCCION,
	COSTOS_M2 as LOCAL_COSTOS_M2,
	TARIFAS_ENTREGABLES_M2 as LOCAL_TARIFAS_ENTREGABLES_M2,
	TARIFAS_EJECUTABLES_M2 as LOCAL_TARIFAS_EJECUTABLES_M2,
} from "@/lib/constants/cotizador";
import { db, storage } from "@/firebase/config";

const CONFIG_DOC_PATH = ["cotizador", "config"] as const;

export class CotizadorService {
	static async getConfig(): Promise<CotizadorConfig> {
		const refDoc = doc(db, ...CONFIG_DOC_PATH);
		const snap = await getDoc(refDoc);

		const fallback: CotizadorConfig = {
			SERVICIO_OPCIONES: LOCAL_SERVICIO_OPCIONES as any,
			CATEGORIA_L1: LOCAL_CATEGORIA_L1 as any,
			CATEGORIA_L2: LOCAL_CATEGORIA_L2 as any,
			CATEGORIA_L3: LOCAL_CATEGORIA_L3 as any,
			ENTREGABLES_DISENO: LOCAL_ENTREGABLES_DISENO as any,
			EJECUTABLES_CONSTRUCCION: LOCAL_EJECUTABLES_CONSTRUCCION as any,
			COSTOS_M2: LOCAL_COSTOS_M2,
			TARIFAS_ENTREGABLES_M2: LOCAL_TARIFAS_ENTREGABLES_M2,
			TARIFAS_EJECUTABLES_M2: LOCAL_TARIFAS_EJECUTABLES_M2,
		};

		if (!snap.exists()) return fallback;

		const remote = snap.data() as Partial<CotizadorConfig>;
		return {
			...fallback,
			...remote,
			CATEGORIA_L2: {
				...fallback.CATEGORIA_L2,
				...(remote.CATEGORIA_L2 || {}),
			},
			CATEGORIA_L3: {
				...fallback.CATEGORIA_L3,
				...(remote.CATEGORIA_L3 || {}),
			},
			COSTOS_M2: { ...fallback.COSTOS_M2, ...(remote.COSTOS_M2 || {}) },
			TARIFAS_ENTREGABLES_M2: {
				...fallback.TARIFAS_ENTREGABLES_M2,
				...(remote.TARIFAS_ENTREGABLES_M2 || {}),
			},
			TARIFAS_EJECUTABLES_M2: {
				...fallback.TARIFAS_EJECUTABLES_M2,
				...(remote.TARIFAS_EJECUTABLES_M2 || {}),
			},
		};
	}

	static async seedDefaults(overrides?: Partial<CotizadorConfig>) {
		const refDoc = doc(db, ...CONFIG_DOC_PATH);
		const payload: CotizadorConfig = {
			SERVICIO_OPCIONES: LOCAL_SERVICIO_OPCIONES as any,
			CATEGORIA_L1: LOCAL_CATEGORIA_L1 as any,
			CATEGORIA_L2: LOCAL_CATEGORIA_L2 as any,
			CATEGORIA_L3: LOCAL_CATEGORIA_L3 as any,
			ENTREGABLES_DISENO: LOCAL_ENTREGABLES_DISENO as any,
			EJECUTABLES_CONSTRUCCION: LOCAL_EJECUTABLES_CONSTRUCCION as any,
			COSTOS_M2: LOCAL_COSTOS_M2,
			TARIFAS_ENTREGABLES_M2: LOCAL_TARIFAS_ENTREGABLES_M2,
			TARIFAS_EJECUTABLES_M2: LOCAL_TARIFAS_EJECUTABLES_M2,
			...overrides,
		};
		await updateDoc(refDoc, payload).catch(async () => {
			await (await import("firebase/firestore")).setDoc(refDoc, payload);
		});
	}

	static async saveQuote(values: FormValues): Promise<string> {
		const cleanNumber = (v: any) => {
			const n = typeof v === "string" ? parseFloat(v) : v;
			return Number.isFinite(n) ? n : 0;
		};

		const basePayload = {
			servicio: values.servicio,
			categoria_l1: values.categoria_l1 ?? "",
			categoria_l2: values.categoria_l2 ?? "",
			categoria_l3: values.categoria_l3 ?? "",
			superficie_m2: cleanNumber(values.superficie_m2),
			todo_diseno: !!values.todo_diseno,
			entregables: values.entregables ?? [],
			todo_construccion: !!values.todo_construccion,
			ejecutables: values.ejecutables ?? [],
			otros_descripcion: values.otros_descripcion ?? "",
			createdAt: serverTimestamp(),
			updatedAt: serverTimestamp(),
			adjunto: null as null | {
				url: string;
				path: string;
				name: string;
				size: number;
				type: string;
			},
		};

		const col = collection(db, "cotizaciones");
		const docRef = await addDoc(col, basePayload);

		if (values.adjunto) {
			const file = values.adjunto;
			const storageRef = ref(
				storage,
				`cotizaciones/${docRef.id}/adjuntos/${Date.now()}_${file.name}`
			);
			const snapshot = await uploadBytes(storageRef, file);
			const url = await getDownloadURL(snapshot.ref);

			await updateDoc(docRef, {
				adjunto: {
					url,
					path: snapshot.ref.fullPath,
					name: file.name,
					size: file.size,
					type: file.type,
				},
				updatedAt: serverTimestamp(),
			});
		}

		return docRef.id;
	}

	static async getQuote(id: string) {
		const refDoc = doc(db, "cotizaciones", id);
		const snap = await getDoc(refDoc);
		if (!snap.exists()) return null;
		const data = snap.data();
		return { id: snap.id, ...data } as any;
	}

	static async listQuotes({
		servicio,
		take = 20,
	}: { servicio?: string; take?: number } = {}) {
		const col = collection(db, "cotizaciones");
		const clauses = [];
		if (servicio) clauses.push(where("servicio", "==", servicio));
		const q = query(col, ...clauses, orderBy("createdAt", "desc"), limit(take));
		const r = await getDocs(q);
		return r.docs.map((d) => ({ id: d.id, ...d.data() }));
	}
}
