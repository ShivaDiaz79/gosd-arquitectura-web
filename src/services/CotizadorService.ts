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

function flattenLeaves(nodes: EjecutableNode[], path: string[] = []) {
	const out: { value: string; label: string; pathLabel: string }[] = [];
	for (const n of nodes) {
		const p = [...path, n.label];
		if (!n.children || n.children.length === 0) {
			out.push({ value: n.value, label: n.label, pathLabel: p.join(" → ") });
		} else {
			out.push(...flattenLeaves(n.children, p));
		}
	}
	return out;
}

function removeFromTree(nodes: EjecutableNode[], value: string) {
	const removed: string[] = [];
	const walk = (arr: EjecutableNode[]): EjecutableNode[] =>
		arr
			.filter((n) => n.value !== value)
			.map((n) => {
				if (n.value === value) return n;
				const children = n.children ? walk(n.children) : undefined;
				return { ...n, ...(children ? { children } : {}) };
			});

	const collectRemoved = (arr: EjecutableNode[]) => {
		for (const n of arr) {
			if (n.value === value) {
				const collect = (x: EjecutableNode) => {
					if (!x.children || x.children.length === 0) removed.push(x.value);
					else x.children.forEach(collect);
				};
				collect(n);
			} else if (n.children) collectRemoved(n.children);
		}
	};
	collectRemoved(nodes);

	const tree = walk(nodes).filter(Boolean) as EjecutableNode[];
	return { tree, removed };
}

function addChild(
	nodes: EjecutableNode[],
	parentValue: string | null,
	node: EjecutableNode
) {
	if (!parentValue) return [...nodes, node];
	const walk = (arr: EjecutableNode[]): EjecutableNode[] =>
		arr.map((n) => {
			if (n.value === parentValue) {
				const children = [...(n.children || []), node];
				return { ...n, children };
			}
			if (n.children) return { ...n, children: walk(n.children) };
			return n;
		});
	return walk(nodes);
}

export type EjecutableNode = {
	value: string;
	label: string;
	children?: EjecutableNode[];
};

export type FormValues = {
	servicio: "diseno" | "construccion" | "diseno_y_construccion" | "";
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
	TARIFAS_EJECUTABLES_M2: Record<string, number>;

	EJECUTABLES_CONSTRUCCION_L1?: { value: string; label: string }[];
	EJECUTABLES_CONSTRUCCION_L2?: Record<
		string,
		{ value: string; label: string }[]
	>;
	MATRIZ_EJECUTABLES_POR_CATEGORIA?: Record<string, string[]>;
	RANGOS_SUPERFICIE_EJECUTABLES?: Record<
		string,
		{ min: number; max?: number; tarifa_m2: number }[]
	>;

	ENTREGABLES_DISENO_L1?: { value: string; label: string }[];
	ENTREGABLES_DISENO_L2?: Record<string, { value: string; label: string }[]>;

	TARIFAS_ENTREGABLES_M2: Record<string, number>;
	MATRIZ_ENTREGABLES_POR_CATEGORIA?: Record<string, string[]>;
	EJECUTABLES_CONSTRUCCION_TREE?: EjecutableNode[];
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
			MATRIZ_ENTREGABLES_POR_CATEGORIA: {},
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

			TARIFAS_EJECUTABLES_M2: {
				...fallback.TARIFAS_EJECUTABLES_M2,
				...(remote.TARIFAS_EJECUTABLES_M2 || {}),
			},

			EJECUTABLES_CONSTRUCCION_L1: remote.EJECUTABLES_CONSTRUCCION_L1 || [],
			EJECUTABLES_CONSTRUCCION_L2: {
				...(remote.EJECUTABLES_CONSTRUCCION_L2 || {}),
			},
			MATRIZ_EJECUTABLES_POR_CATEGORIA: {
				...(remote.MATRIZ_EJECUTABLES_POR_CATEGORIA || {}),
			},
			RANGOS_SUPERFICIE_EJECUTABLES: {
				...(remote.RANGOS_SUPERFICIE_EJECUTABLES || {}),
			},
			ENTREGABLES_DISENO_L1: remote.ENTREGABLES_DISENO_L1 || [],
			ENTREGABLES_DISENO_L2: { ...(remote.ENTREGABLES_DISENO_L2 || {}) },
			MATRIZ_ENTREGABLES_POR_CATEGORIA: {
				...(remote.MATRIZ_ENTREGABLES_POR_CATEGORIA || {}),
			},
			TARIFAS_ENTREGABLES_M2: {
				...fallback.TARIFAS_ENTREGABLES_M2,
				...(remote.TARIFAS_ENTREGABLES_M2 || {}),
			},
			EJECUTABLES_CONSTRUCCION_TREE: remote.EJECUTABLES_CONSTRUCCION_TREE || [],
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
			MATRIZ_ENTREGABLES_POR_CATEGORIA: {},
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

	static async addServicioOpcion(opcion: { value: string; label: string }) {
		const refDoc = doc(db, ...CONFIG_DOC_PATH);
		const snap = await getDoc(refDoc);
		const current =
			(snap.exists() &&
				(snap.data() as Partial<CotizadorConfig>).SERVICIO_OPCIONES) ||
			[];

		const exists = current.some((o: any) => (o?.value || "") === opcion.value);
		const next = exists
			? current.map((o: any) =>
					o.value === opcion.value ? { ...o, ...opcion } : o
			  )
			: [...current, opcion];

		try {
			await updateDoc(refDoc, { SERVICIO_OPCIONES: next });
		} catch {
			const { setDoc } = await import("firebase/firestore");
			await setDoc(refDoc, { SERVICIO_OPCIONES: next }, { merge: true });
		}
		return next as CotizadorConfig["SERVICIO_OPCIONES"];
	}

	static async removeServicioOpcion(value: string) {
		const refDoc = doc(db, ...CONFIG_DOC_PATH);
		const snap = await getDoc(refDoc);
		if (!snap.exists()) return [];

		const current = (
			(snap.data() as Partial<CotizadorConfig>).SERVICIO_OPCIONES || []
		).filter((o: any) => (o?.value || "") !== value);

		await updateDoc(refDoc, { SERVICIO_OPCIONES: current }).catch(async () => {
			const { setDoc } = await import("firebase/firestore");
			await setDoc(refDoc, { SERVICIO_OPCIONES: current }, { merge: true });
		});
		return current as CotizadorConfig["SERVICIO_OPCIONES"];
	}

	private static _safeGet<T = any>(
		snap: any,
		key: keyof CotizadorConfig,
		def: T
	): T {
		return snap.exists() && snap.data()?.[key] ? (snap.data()[key] as T) : def;
	}

	static async addCategoriaL1(opcion: { value: string; label: string }) {
		const refDoc = doc(db, ...CONFIG_DOC_PATH);
		const snap = await getDoc(refDoc);

		const L1 = this._safeGet(
			snap,
			"CATEGORIA_L1",
			[] as { value: string; label: string }[]
		);
		const exists = L1.some((o) => o.value === opcion.value);
		const nextL1 = exists
			? L1.map((o) => (o.value === opcion.value ? { ...o, ...opcion } : o))
			: [...L1, opcion];

		try {
			await updateDoc(refDoc, { CATEGORIA_L1: nextL1 });
		} catch {
			const { setDoc } = await import("firebase/firestore");
			await setDoc(refDoc, { CATEGORIA_L1: nextL1 }, { merge: true });
		}
		return nextL1;
	}

	static async removeCategoriaL1(valueL1: string) {
		const refDoc = doc(db, ...CONFIG_DOC_PATH);
		const snap = await getDoc(refDoc);
		if (!snap.exists()) return { L1: [], L2: {}, L3: {} };

		const data = snap.data() as Partial<CotizadorConfig>;
		const L1 = (data.CATEGORIA_L1 || []).filter((o) => o.value !== valueL1);

		const L2 = { ...(data.CATEGORIA_L2 || {}) };
		const hijosL2 = (L2[valueL1] || []).map((o) => o.value);
		delete L2[valueL1];

		const L3 = { ...(data.CATEGORIA_L3 || {}) };
		for (const vL2 of hijosL2) {
			delete L3[vL2];
		}

		try {
			await updateDoc(refDoc, {
				CATEGORIA_L1: L1,
				CATEGORIA_L2: L2,
				CATEGORIA_L3: L3,
			});
		} catch {
			const { setDoc } = await import("firebase/firestore");
			await setDoc(
				refDoc,
				{ CATEGORIA_L1: L1, CATEGORIA_L2: L2, CATEGORIA_L3: L3 },
				{ merge: true }
			);
		}
		return { L1, L2, L3 };
	}

	static async addCategoriaL2(
		parentL1: string,
		opcion: { value: string; label: string }
	) {
		if (!parentL1) throw new Error("Debe seleccionar un padre (L1) para L2.");
		const refDoc = doc(db, ...CONFIG_DOC_PATH);
		const snap = await getDoc(refDoc);

		const L2 = this._safeGet(
			snap,
			"CATEGORIA_L2",
			{} as Record<string, { value: string; label: string }[]>
		);
		const arr = L2[parentL1] || [];
		const exists = arr.some((o) => o.value === opcion.value);
		const nextArr = exists
			? arr.map((o) => (o.value === opcion.value ? { ...o, ...opcion } : o))
			: [...arr, opcion];
		const nextL2 = { ...L2, [parentL1]: nextArr };

		try {
			await updateDoc(refDoc, { CATEGORIA_L2: nextL2 });
		} catch {
			const { setDoc } = await import("firebase/firestore");
			await setDoc(refDoc, { CATEGORIA_L2: nextL2 }, { merge: true });
		}
		return nextL2;
	}

	static async removeCategoriaL2(parentL1: string, valueL2: string) {
		if (!parentL1) throw new Error("Falta el padre (L1).");
		const refDoc = doc(db, ...CONFIG_DOC_PATH);
		const snap = await getDoc(refDoc);
		if (!snap.exists()) return { L2: {}, L3: {} };

		const data = snap.data() as Partial<CotizadorConfig>;
		const L2 = { ...(data.CATEGORIA_L2 || {}) };
		const arr = (L2[parentL1] || []).filter((o) => o.value !== valueL2);
		if (arr.length) L2[parentL1] = arr;
		else delete L2[parentL1];

		const L3 = { ...(data.CATEGORIA_L3 || {}) };
		delete L3[valueL2];

		try {
			await updateDoc(refDoc, { CATEGORIA_L2: L2, CATEGORIA_L3: L3 });
		} catch {
			const { setDoc } = await import("firebase/firestore");
			await setDoc(
				refDoc,
				{ CATEGORIA_L2: L2, CATEGORIA_L3: L3 },
				{ merge: true }
			);
		}
		return { L2, L3 };
	}

	static async addCategoriaL3(
		parentL2: string,
		opcion: { value: string; label: string }
	) {
		if (!parentL2) throw new Error("Debe seleccionar un padre (L2) para L3.");
		const refDoc = doc(db, ...CONFIG_DOC_PATH);
		const snap = await getDoc(refDoc);

		const L3 = this._safeGet(
			snap,
			"CATEGORIA_L3",
			{} as Record<string, { value: string; label: string }[]>
		);
		const arr = L3[parentL2] || [];
		const exists = arr.some((o) => o.value === opcion.value);
		const nextArr = exists
			? arr.map((o) => (o.value === opcion.value ? { ...o, ...opcion } : o))
			: [...arr, opcion];
		const nextL3 = { ...L3, [parentL2]: nextArr };

		try {
			await updateDoc(refDoc, { CATEGORIA_L3: nextL3 });
		} catch {
			const { setDoc } = await import("firebase/firestore");
			await setDoc(refDoc, { CATEGORIA_L3: nextL3 }, { merge: true });
		}
		return nextL3;
	}

	static async removeCategoriaL3(parentL2: string, valueL3: string) {
		if (!parentL2) throw new Error("Falta el padre (L2).");
		const refDoc = doc(db, ...CONFIG_DOC_PATH);
		const snap = await getDoc(refDoc);
		if (!snap.exists()) return { L3: {} };

		const data = snap.data() as Partial<CotizadorConfig>;
		const L3 = { ...(data.CATEGORIA_L3 || {}) };
		const arr = (L3[parentL2] || []).filter((o) => o.value !== valueL3);
		if (arr.length) L3[parentL2] = arr;
		else delete L3[parentL2];

		try {
			await updateDoc(refDoc, { CATEGORIA_L3: L3 });
		} catch {
			const { setDoc } = await import("firebase/firestore");
			await setDoc(refDoc, { CATEGORIA_L3: L3 }, { merge: true });
		}
		return { L3 };
	}

	static async addEntregableDiseno(op: { value: string; text: string }) {
		const refDoc = doc(db, ...CONFIG_DOC_PATH);
		const snap = await getDoc(refDoc);
		const current =
			(snap.exists() &&
				(snap.data() as Partial<CotizadorConfig>).ENTREGABLES_DISENO) ||
			[];
		const exists = current.some((o: any) => o.value === op.value);
		const next = exists
			? current.map((o: any) => (o.value === op.value ? { ...o, ...op } : o))
			: [...current, op];

		await updateDoc(refDoc, { ENTREGABLES_DISENO: next }).catch(async () => {
			const { setDoc } = await import("firebase/firestore");
			await setDoc(refDoc, { ENTREGABLES_DISENO: next }, { merge: true });
		});
		return next as CotizadorConfig["ENTREGABLES_DISENO"];
	}

	static async removeEntregableDiseno(value: string) {
		const refDoc = doc(db, ...CONFIG_DOC_PATH);
		const snap = await getDoc(refDoc);
		if (!snap.exists()) return [];

		const data = snap.data() as Partial<CotizadorConfig>;
		const nextList = (data.ENTREGABLES_DISENO || []).filter(
			(e) => e.value !== value
		);

		const tarifas = { ...(data.TARIFAS_ENTREGABLES_M2 || {}) };
		delete tarifas[value];

		const matriz = { ...(data.MATRIZ_ENTREGABLES_POR_CATEGORIA || {}) };
		for (const k of Object.keys(matriz)) {
			matriz[k] = (matriz[k] || []).filter((v) => v !== value);
		}

		await updateDoc(refDoc, {
			ENTREGABLES_DISENO: nextList,
			TARIFAS_ENTREGABLES_M2: tarifas,
			MATRIZ_ENTREGABLES_POR_CATEGORIA: matriz,
		}).catch(async () => {
			const { setDoc } = await import("firebase/firestore");
			await setDoc(
				refDoc,
				{
					ENTREGABLES_DISENO: nextList,
					TARIFAS_ENTREGABLES_M2: tarifas,
					MATRIZ_ENTREGABLES_POR_CATEGORIA: matriz,
				},
				{ merge: true }
			);
		});

		return nextList as CotizadorConfig["ENTREGABLES_DISENO"];
	}

	static async setTarifaEntregableM2(value: string, tarifaM2: number) {
		const refDoc = doc(db, ...CONFIG_DOC_PATH);
		const snap = await getDoc(refDoc);
		const tarifas =
			(snap.exists() &&
				(snap.data() as Partial<CotizadorConfig>).TARIFAS_ENTREGABLES_M2) ||
			{};
		const next = { ...tarifas, [value]: tarifaM2 };
		await updateDoc(refDoc, { TARIFAS_ENTREGABLES_M2: next }).catch(
			async () => {
				const { setDoc } = await import("firebase/firestore");
				await setDoc(refDoc, { TARIFAS_ENTREGABLES_M2: next }, { merge: true });
			}
		);
		return next as CotizadorConfig["TARIFAS_ENTREGABLES_M2"];
	}

	static async bulkSetTarifasEntregablesM2(input: Record<string, number>) {
		const refDoc = doc(db, ...CONFIG_DOC_PATH);
		const snap = await getDoc(refDoc);
		const current =
			(snap.exists() &&
				(snap.data() as Partial<CotizadorConfig>).TARIFAS_ENTREGABLES_M2) ||
			{};
		const next = { ...current, ...input };
		await updateDoc(refDoc, { TARIFAS_ENTREGABLES_M2: next }).catch(
			async () => {
				const { setDoc } = await import("firebase/firestore");
				await setDoc(refDoc, { TARIFAS_ENTREGABLES_M2: next }, { merge: true });
			}
		);
		return next as CotizadorConfig["TARIFAS_ENTREGABLES_M2"];
	}

	static async setMatrizEntregablesCategoria(
		catKey: string,
		entregables: string[]
	) {
		const refDoc = doc(db, ...CONFIG_DOC_PATH);
		const snap = await getDoc(refDoc);
		const matriz =
			(snap.exists() &&
				(snap.data() as Partial<CotizadorConfig>)
					.MATRIZ_ENTREGABLES_POR_CATEGORIA) ||
			{};
		const next = { ...matriz, [catKey]: entregables };
		await updateDoc(refDoc, { MATRIZ_ENTREGABLES_POR_CATEGORIA: next }).catch(
			async () => {
				const { setDoc } = await import("firebase/firestore");
				await setDoc(
					refDoc,
					{ MATRIZ_ENTREGABLES_POR_CATEGORIA: next },
					{ merge: true }
				);
			}
		);
		return next as NonNullable<
			CotizadorConfig["MATRIZ_ENTREGABLES_POR_CATEGORIA"]
		>;
	}

	static async addEjecutableConstruccion(op: { value: string; text: string }) {
		const refDoc = doc(db, ...CONFIG_DOC_PATH);
		const snap = await getDoc(refDoc);
		const list =
			(snap.exists() &&
				(snap.data() as Partial<CotizadorConfig>).EJECUTABLES_CONSTRUCCION) ||
			[];
		const exists = list.some((o: any) => o.value === op.value);
		const next = exists
			? list.map((o: any) => (o.value === op.value ? { ...o, ...op } : o))
			: [...list, op];

		await updateDoc(refDoc, { EJECUTABLES_CONSTRUCCION: next }).catch(
			async () => {
				const { setDoc } = await import("firebase/firestore");
				await setDoc(
					refDoc,
					{ EJECUTABLES_CONSTRUCCION: next },
					{ merge: true }
				);
			}
		);
		return next as CotizadorConfig["EJECUTABLES_CONSTRUCCION"];
	}

	static async removeEjecutableConstruccion(value: string) {
		const refDoc = doc(db, ...CONFIG_DOC_PATH);
		const snap = await getDoc(refDoc);
		if (!snap.exists()) return [];

		const data = snap.data() as Partial<CotizadorConfig>;
		const nextList = (data.EJECUTABLES_CONSTRUCCION || []).filter(
			(e) => e.value !== value
		);

		const tarifas = { ...(data.TARIFAS_EJECUTABLES_M2 || {}) };
		delete tarifas[value];

		const matriz = { ...(data.MATRIZ_EJECUTABLES_POR_CATEGORIA || {}) };
		for (const k of Object.keys(matriz)) {
			matriz[k] = (matriz[k] || []).filter((v) => v !== value);
		}

		const rangos = { ...(data.RANGOS_SUPERFICIE_EJECUTABLES || {}) };
		delete rangos[value];

		await updateDoc(refDoc, {
			EJECUTABLES_CONSTRUCCION: nextList,
			TARIFAS_EJECUTABLES_M2: tarifas,
			MATRIZ_EJECUTABLES_POR_CATEGORIA: matriz,
			RANGOS_SUPERFICIE_EJECUTABLES: rangos,
		}).catch(async () => {
			const { setDoc } = await import("firebase/firestore");
			await setDoc(
				refDoc,
				{
					EJECUTABLES_CONSTRUCCION: nextList,
					TARIFAS_EJECUTABLES_M2: tarifas,
					MATRIZ_EJECUTABLES_POR_CATEGORIA: matriz,
					RANGOS_SUPERFICIE_EJECUTABLES: rangos,
				},
				{ merge: true }
			);
		});

		return nextList as CotizadorConfig["EJECUTABLES_CONSTRUCCION"];
	}

	static async bulkSetTarifasEjecutablesM2(input: Record<string, number>) {
		const refDoc = doc(db, ...CONFIG_DOC_PATH);
		const snap = await getDoc(refDoc);
		const current =
			(snap.exists() &&
				(snap.data() as Partial<CotizadorConfig>).TARIFAS_EJECUTABLES_M2) ||
			{};
		const next = { ...current, ...input };
		await updateDoc(refDoc, { TARIFAS_EJECUTABLES_M2: next }).catch(
			async () => {
				const { setDoc } = await import("firebase/firestore");
				await setDoc(refDoc, { TARIFAS_EJECUTABLES_M2: next }, { merge: true });
			}
		);
		return next as CotizadorConfig["TARIFAS_EJECUTABLES_M2"];
	}

	static async setMatrizEjecutablesCategoria(
		catKey: string,
		ejecutables: string[]
	) {
		const refDoc = doc(db, ...CONFIG_DOC_PATH);
		const snap = await getDoc(refDoc);
		const matriz =
			(snap.exists() &&
				(snap.data() as Partial<CotizadorConfig>)
					.MATRIZ_EJECUTABLES_POR_CATEGORIA) ||
			{};
		const next = { ...matriz, [catKey]: ejecutables };

		await updateDoc(refDoc, { MATRIZ_EJECUTABLES_POR_CATEGORIA: next }).catch(
			async () => {
				const { setDoc } = await import("firebase/firestore");
				await setDoc(
					refDoc,
					{ MATRIZ_EJECUTABLES_POR_CATEGORIA: next },
					{ merge: true }
				);
			}
		);
		return next as NonNullable<
			CotizadorConfig["MATRIZ_EJECUTABLES_POR_CATEGORIA"]
		>;
	}

	static async setRangosSuperficieEjecutable(
		value: string,
		rangos: { min: number; max?: number; tarifa_m2: number }[]
	) {
		const refDoc = doc(db, ...CONFIG_DOC_PATH);
		const snap = await getDoc(refDoc);
		const current =
			(snap.exists() &&
				(snap.data() as Partial<CotizadorConfig>)
					.RANGOS_SUPERFICIE_EJECUTABLES) ||
			{};
		const next = { ...current, [value]: rangos };

		await updateDoc(refDoc, { RANGOS_SUPERFICIE_EJECUTABLES: next }).catch(
			async () => {
				const { setDoc } = await import("firebase/firestore");
				await setDoc(
					refDoc,
					{ RANGOS_SUPERFICIE_EJECUTABLES: next },
					{ merge: true }
				);
			}
		);
		return next as NonNullable<
			CotizadorConfig["RANGOS_SUPERFICIE_EJECUTABLES"]
		>;
	}

	static async addEjecutableGrupo(op: { value: string; label: string }) {
		const refDoc = doc(db, ...CONFIG_DOC_PATH);
		const snap = await getDoc(refDoc);
		const L1 =
			(snap.exists() && (snap.data() as any).EJECUTABLES_CONSTRUCCION_L1) || [];
		const exists = L1.some((o: any) => o.value === op.value);
		const next = exists
			? L1.map((o: any) => (o.value === op.value ? op : o))
			: [...L1, op];
		await updateDoc(refDoc, { EJECUTABLES_CONSTRUCCION_L1: next }).catch(
			async () => {
				const { setDoc } = await import("firebase/firestore");
				await setDoc(
					refDoc,
					{ EJECUTABLES_CONSTRUCCION_L1: next },
					{ merge: true }
				);
			}
		);
		return next as { value: string; label: string }[];
	}

	static async removeEjecutableGrupo(valueL1: string) {
		const refDoc = doc(db, ...CONFIG_DOC_PATH);
		const snap = await getDoc(refDoc);
		if (!snap.exists()) return;
		const data = snap.data() as CotizadorConfig;

		const L1 = (data.EJECUTABLES_CONSTRUCCION_L1 || []).filter(
			(g) => g.value !== valueL1
		);
		const L2 = { ...(data.EJECUTABLES_CONSTRUCCION_L2 || {}) };
		const hijos = (L2[valueL1] || []).map((x) => x.value);
		delete L2[valueL1];

		const tarifas = { ...(data.TARIFAS_EJECUTABLES_M2 || {}) };
		const rangos = { ...(data.RANGOS_SUPERFICIE_EJECUTABLES || {}) };
		for (const v of hijos) {
			delete tarifas[v];
			delete rangos[v];
		}

		const matriz = { ...(data.MATRIZ_EJECUTABLES_POR_CATEGORIA || {}) };
		for (const k of Object.keys(matriz))
			matriz[k] = (matriz[k] || []).filter((v) => !hijos.includes(v));

		await updateDoc(refDoc, {
			EJECUTABLES_CONSTRUCCION_L1: L1,
			EJECUTABLES_CONSTRUCCION_L2: L2,
			TARIFAS_EJECUTABLES_M2: tarifas,
			RANGOS_SUPERFICIE_EJECUTABLES: rangos,
			MATRIZ_EJECUTABLES_POR_CATEGORIA: matriz,
		});
	}

	static async addEjecutableSub(
		parentL1: string,
		op: { value: string; label: string }
	) {
		if (!parentL1) throw new Error("Seleccione un grupo (L1).");
		const refDoc = doc(db, ...CONFIG_DOC_PATH);
		const snap = await getDoc(refDoc);
		const L2 =
			(snap.exists() && (snap.data() as any).EJECUTABLES_CONSTRUCCION_L2) || {};
		const arr = L2[parentL1] || [];
		const exists = arr.some((x: any) => x.value === op.value);
		const nextArr = exists
			? arr.map((x: any) => (x.value === op.value ? op : x))
			: [...arr, op];
		const next = { ...L2, [parentL1]: nextArr };
		await updateDoc(refDoc, { EJECUTABLES_CONSTRUCCION_L2: next }).catch(
			async () => {
				const { setDoc } = await import("firebase/firestore");
				await setDoc(
					refDoc,
					{ EJECUTABLES_CONSTRUCCION_L2: next },
					{ merge: true }
				);
			}
		);
		return next as Record<string, { value: string; label: string }[]>;
	}

	static async removeEjecutableSub(parentL1: string, valueL2: string) {
		const refDoc = doc(db, ...CONFIG_DOC_PATH);
		const snap = await getDoc(refDoc);
		if (!snap.exists()) return;
		const data = snap.data() as CotizadorConfig;

		const L2 = { ...(data.EJECUTABLES_CONSTRUCCION_L2 || {}) };
		L2[parentL1] = (L2[parentL1] || []).filter((x) => x.value !== valueL2);
		if (!L2[parentL1]?.length) delete L2[parentL1];

		const tarifas = { ...(data.TARIFAS_EJECUTABLES_M2 || {}) };
		const rangos = { ...(data.RANGOS_SUPERFICIE_EJECUTABLES || {}) };
		delete tarifas[valueL2];
		delete rangos[valueL2];

		const matriz = { ...(data.MATRIZ_EJECUTABLES_POR_CATEGORIA || {}) };
		for (const k of Object.keys(matriz))
			matriz[k] = (matriz[k] || []).filter((v) => v !== valueL2);

		await updateDoc(refDoc, {
			EJECUTABLES_CONSTRUCCION_L2: L2,
			TARIFAS_EJECUTABLES_M2: tarifas,
			RANGOS_SUPERFICIE_EJECUTABLES: rangos,
			MATRIZ_EJECUTABLES_POR_CATEGORIA: matriz,
		});
	}

	static async addEntregableDisenoGrupo(op: { value: string; label: string }) {
		const refDoc = doc(db, ...CONFIG_DOC_PATH);
		const snap = await getDoc(refDoc);
		const L1 =
			(snap.exists() && (snap.data() as any).ENTREGABLES_DISENO_L1) || [];
		const exists = L1.some((o: any) => o.value === op.value);
		const next = exists
			? L1.map((o: any) => (o.value === op.value ? op : o))
			: [...L1, op];
		await updateDoc(refDoc, { ENTREGABLES_DISENO_L1: next }).catch(async () => {
			const { setDoc } = await import("firebase/firestore");
			await setDoc(refDoc, { ENTREGABLES_DISENO_L1: next }, { merge: true });
		});
		return next as { value: string; label: string }[];
	}

	static async removeEntregableDisenoGrupo(valueL1: string) {
		const refDoc = doc(db, ...CONFIG_DOC_PATH);
		const snap = await getDoc(refDoc);
		if (!snap.exists()) return;
		const data = snap.data() as CotizadorConfig;

		const L1 = (data.ENTREGABLES_DISENO_L1 || []).filter(
			(g) => g.value !== valueL1
		);
		const L2 = { ...(data.ENTREGABLES_DISENO_L2 || {}) };
		const hijos = (L2[valueL1] || []).map((x) => x.value);
		delete L2[valueL1];

		const tarifas = { ...(data.TARIFAS_ENTREGABLES_M2 || {}) };
		for (const v of hijos) delete tarifas[v];

		const matriz = { ...(data.MATRIZ_ENTREGABLES_POR_CATEGORIA || {}) };
		for (const k of Object.keys(matriz))
			matriz[k] = (matriz[k] || []).filter((v) => !hijos.includes(v));

		await updateDoc(refDoc, {
			ENTREGABLES_DISENO_L1: L1,
			ENTREGABLES_DISENO_L2: L2,
			TARIFAS_ENTREGABLES_M2: tarifas,
			MATRIZ_ENTREGABLES_POR_CATEGORIA: matriz,
		});
	}

	static async addEntregableDisenoSub(
		parentL1: string,
		op: { value: string; label: string }
	) {
		if (!parentL1) throw new Error("Seleccione un grupo (L1).");
		const refDoc = doc(db, ...CONFIG_DOC_PATH);
		const snap = await getDoc(refDoc);
		const L2 =
			(snap.exists() && (snap.data() as any).ENTREGABLES_DISENO_L2) || {};
		const arr = L2[parentL1] || [];
		const exists = arr.some((x: any) => x.value === op.value);
		const nextArr = exists
			? arr.map((x: any) => (x.value === op.value ? op : x))
			: [...arr, op];
		const next = { ...L2, [parentL1]: nextArr };
		await updateDoc(refDoc, { ENTREGABLES_DISENO_L2: next }).catch(async () => {
			const { setDoc } = await import("firebase/firestore");
			await setDoc(refDoc, { ENTREGABLES_DISENO_L2: next }, { merge: true });
		});
		return next as Record<string, { value: string; label: string }[]>;
	}

	static async removeEntregableDisenoSub(parentL1: string, valueL2: string) {
		const refDoc = doc(db, ...CONFIG_DOC_PATH);
		const snap = await getDoc(refDoc);
		if (!snap.exists()) return;
		const data = snap.data() as CotizadorConfig;

		const L2 = { ...(data.ENTREGABLES_DISENO_L2 || {}) };
		L2[parentL1] = (L2[parentL1] || []).filter((x) => x.value !== valueL2);
		if (!L2[parentL1]?.length) delete L2[parentL1];

		const tarifas = { ...(data.TARIFAS_ENTREGABLES_M2 || {}) };
		delete tarifas[valueL2];
		const matriz = { ...(data.MATRIZ_ENTREGABLES_POR_CATEGORIA || {}) };
		for (const k of Object.keys(matriz))
			matriz[k] = (matriz[k] || []).filter((v) => v !== valueL2);

		await updateDoc(refDoc, {
			ENTREGABLES_DISENO_L2: L2,
			TARIFAS_ENTREGABLES_M2: tarifas,
			MATRIZ_ENTREGABLES_POR_CATEGORIA: matriz,
		});
	}

	static async addEjecutableNode(payload: {
		parentValue?: string | null;
		value: string;
		label: string;
	}) {
		const refDoc = doc(db, ...CONFIG_DOC_PATH);
		const snap = await getDoc(refDoc);
		const tree =
			(snap.exists() && (snap.data() as any).EJECUTABLES_CONSTRUCCION_TREE) ||
			[];

		if (!/^[a-z0-9_]+$/.test(payload.value)) throw new Error("Slug inválido.");
		const next = addChild(tree, payload.parentValue ?? null, {
			value: payload.value,
			label: payload.label,
		});

		await updateDoc(refDoc, { EJECUTABLES_CONSTRUCCION_TREE: next }).catch(
			async () => {
				const { setDoc } = await import("firebase/firestore");
				await setDoc(
					refDoc,
					{ EJECUTABLES_CONSTRUCCION_TREE: next },
					{ merge: true }
				);
			}
		);
		return next as EjecutableNode[];
	}

	static async removeEjecutableNode(value: string) {
		const refDoc = doc(db, ...CONFIG_DOC_PATH);
		const snap = await getDoc(refDoc);
		if (!snap.exists()) return;
		const data = snap.data() as CotizadorConfig;

		const currTree = data.EJECUTABLES_CONSTRUCCION_TREE || [];
		const { tree: nextTree, removed } = removeFromTree(currTree, value);

		const tarifas = { ...(data.TARIFAS_EJECUTABLES_M2 || {}) };
		const rangos = { ...(data.RANGOS_SUPERFICIE_EJECUTABLES || {}) };
		for (const v of removed) {
			delete tarifas[v];
			delete rangos[v];
		}
		const matriz = { ...(data.MATRIZ_EJECUTABLES_POR_CATEGORIA || {}) };
		for (const k of Object.keys(matriz)) {
			matriz[k] = (matriz[k] || []).filter((v) => !removed.includes(v));
		}

		await updateDoc(refDoc, {
			EJECUTABLES_CONSTRUCCION_TREE: nextTree,
			TARIFAS_EJECUTABLES_M2: tarifas,
			RANGOS_SUPERFICIE_EJECUTABLES: rangos,
			MATRIZ_EJECUTABLES_POR_CATEGORIA: matriz,
		});
		return nextTree as EjecutableNode[];
	}

	static async listEjecutablesLeaves() {
		const cfg = await CotizadorService.getConfig();
		return flattenLeaves(cfg.EJECUTABLES_CONSTRUCCION_TREE || []);
	}
}
