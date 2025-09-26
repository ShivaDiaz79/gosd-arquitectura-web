import { db } from "@/firebase/config";
import {
	collection,
	addDoc,
	updateDoc,
	doc,
	getDoc,
	onSnapshot,
	query,
	orderBy,
	startAfter,
	limit as fbLimit,
	Timestamp,
	QueryDocumentSnapshot,
	DocumentData,
	deleteDoc,
	Query,
	where,
} from "firebase/firestore";
import type { LaborRow } from "@/lib/types/labor.type";

export type PageListenResult = {
	labors: LaborRow[];
	lastDoc?: QueryDocumentSnapshot<DocumentData>;
	hasNext: boolean;
};

function toDate(v: any): Date | null {
	if (!v) return null;
	if (v instanceof Date) return v;
	if (v instanceof Timestamp) return v.toDate();
	const d = new Date(v);
	return isNaN(+d) ? null : d;
}

function mapDoc(d: QueryDocumentSnapshot<DocumentData>): LaborRow {
	const data = d.data() || {};
	return {
		id: d.id,
		name: data.name || "",
		category: data.category || "",
		unit: (data.unit as "hora" | "día") || "hora",
		hoursPerDay: typeof data.hoursPerDay === "number" ? data.hoursPerDay : 8,
		rateBs: typeof data.rateBs === "number" ? data.rateBs : 0,
		rateUsd: typeof data.rateUsd === "number" ? data.rateUsd : 0,
		createdAt: toDate(data.createdAt),
		updatedAt: toDate(data.updatedAt),
	};
}

/** Búsqueda server-side por prefijo en nameLower */
function pageQuery(
	pageSize: number,
	after?: QueryDocumentSnapshot<DocumentData>,
	search?: string
): Query<DocumentData> {
	const col = collection(db, "labors");
	const s = (search || "").trim().toLowerCase();

	if (s) {
		const start = s;
		const end = s + "\uf8ff";
		const base = query(col, orderBy("nameLower"));
		const bounded = query(
			base,
			where("nameLower", ">=", start),
			where("nameLower", "<=", end),
			fbLimit(pageSize + 1)
		);
		return after ? query(bounded, startAfter(after)) : bounded;
	}

	const base = query(col, orderBy("createdAt", "desc"));
	return after
		? query(base, startAfter(after), fbLimit(pageSize + 1))
		: query(base, fbLimit(pageSize + 1));
}

export class LaborService {
	static async create(data: {
		name: string;
		category?: string;
		unit: "hora" | "día";
		hoursPerDay?: number;
		rateBs: number;
		rateUsd: number;
	}): Promise<{ id: string }> {
		const col = collection(db, "labors");
		const base = await addDoc(col, {
			name: data.name.trim(),
			nameLower: data.name.trim().toLowerCase(),
			category: data.category?.trim() || "",
			unit: data.unit,
			hoursPerDay: typeof data.hoursPerDay === "number" ? data.hoursPerDay : 8,
			rateBs: Number(data.rateBs) || 0,
			rateUsd: Number(data.rateUsd) || 0,
			createdAt: new Date(),
			updatedAt: new Date(),
		});
		return { id: base.id };
	}

	static listenPage(opts: {
		pageSize: number;
		search?: string;
		after?: QueryDocumentSnapshot<DocumentData>;
		onResult: (res: PageListenResult) => void;
		onError?: (e: any) => void;
	}): () => void {
		const q = pageQuery(opts.pageSize, opts.after, opts.search);
		return onSnapshot(
			q,
			(snap) => {
				const docs = snap.docs;
				const hasNext = docs.length > opts.pageSize;
				const pageDocs = hasNext ? docs.slice(0, opts.pageSize) : docs;
				const labors = pageDocs.map(mapDoc);
				const lastDoc = pageDocs[pageDocs.length - 1];
				opts.onResult({ labors, lastDoc, hasNext });
			},
			opts.onError
		);
	}

	static async getById(id: string): Promise<LaborRow | null> {
		const ref = doc(db, "labors", id);
		const snap = await getDoc(ref);
		if (!snap.exists()) return null;
		return mapDoc(snap as any);
	}

	static async update(
		id: string,
		data: {
			name: string;
			category?: string;
			unit: "hora" | "día";
			hoursPerDay?: number | null;
			rateBs: number;
			rateUsd: number;
		}
	) {
		const refDoc = doc(db, "labors", id);
		const snap = await getDoc(refDoc);
		if (!snap.exists()) throw new Error("Registro no encontrado");

		await updateDoc(refDoc, {
			name: data.name.trim(),
			nameLower: data.name.trim().toLowerCase(),
			category: data.category?.trim() || "",
			unit: data.unit,
			hoursPerDay:
				typeof data.hoursPerDay === "number" || data.hoursPerDay === null
					? data.hoursPerDay ?? 8
					: 8,
			rateBs: Number(data.rateBs) || 0,
			rateUsd: Number(data.rateUsd) || 0,
			updatedAt: new Date(),
		});
	}

	static async remove(id: string) {
		const refDoc = doc(db, "labors", id);
		await deleteDoc(refDoc);
	}
}
