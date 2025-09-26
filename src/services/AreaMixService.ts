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
	where,
} from "firebase/firestore";
import type { AreaMixRow } from "@/lib/types/area-mix.type";

export type AreaMixPage = {
	mixes: AreaMixRow[];
	lastDoc?: QueryDocumentSnapshot<DocumentData>;
	hasNext: boolean;
};

function toDate(x: any): Date | null {
	if (!x) return null;
	if (x instanceof Date) return x;
	if (x instanceof Timestamp) return x.toDate();
	const d = new Date(x);
	return isNaN(+d) ? null : d;
}

function mapDoc(d: QueryDocumentSnapshot<DocumentData>): AreaMixRow {
	const x = d.data() || {};
	return {
		id: d.id,
		name: x.name || "",
		categoryId: x.categoryId || "",
		notes: x.notes || "",
		feeId: x.feeId || null,
		feeName: x.feeName || null,
		feeNameLower: x.feeNameLower || null,
		shares: typeof x.shares === "object" && x.shares ? x.shares : {},
		createdAt: toDate(x.createdAt),
		updatedAt: toDate(x.updatedAt),
	};
}

function validateShares(shares: Record<string, number>) {
	const sum = Object.values(shares).reduce((a, b) => a + (Number(b) || 0), 0);
	if (sum <= 0) throw new Error("Debes definir al menos un porcentaje.");
	if (Math.abs(sum - 1) > 0.001)
		throw new Error("Los porcentajes deben sumar 100%.");
}

function pageQuery(
	pageSize: number,
	after?: QueryDocumentSnapshot<DocumentData>,
	search?: string,
	categoryId?: string,
	feeId?: string
) {
	const col = collection(db, "area_mix");
	const s = (search || "").trim().toLowerCase();

	const constraints: any[] = [];
	if (s) {
		constraints.push(orderBy("nameLower"));
		constraints.push(where("nameLower", ">=", s));
		constraints.push(where("nameLower", "<=", s + "\uf8ff"));
	} else {
		constraints.push(orderBy("createdAt", "desc"));
	}
	if (categoryId) constraints.push(where("categoryId", "==", categoryId));
	if (feeId) constraints.push(where("feeId", "==", feeId));

	const base = query(col, ...constraints, fbLimit(pageSize + 1));
	return after ? query(base, startAfter(after)) : base;
}

export class AreaMixService {
	static async create(data: {
		name: string;
		categoryId?: string;
		notes?: string;
		shares: Record<string, number>;
		feeId?: string | null;
		feeName?: string | null;
	}) {
		validateShares(data.shares);
		const col = collection(db, "area_mix");
		const ref = await addDoc(col, {
			name: data.name.trim(),
			nameLower: data.name.trim().toLowerCase(),
			categoryId: data.categoryId || "",
			notes: data.notes || "",
			shares: data.shares,
			feeId: data.feeId ?? null,
			feeName: data.feeName ?? null,
			feeNameLower: data.feeName ? String(data.feeName).toLowerCase() : null,
			createdAt: new Date(),
			updatedAt: new Date(),
		});
		return { id: ref.id };
	}

	static listenPage(opts: {
		pageSize: number;
		after?: QueryDocumentSnapshot<DocumentData>;
		search?: string;
		categoryId?: string;
		feeId?: string;
		onResult: (res: AreaMixPage) => void;
		onError?: (e: any) => void;
	}) {
		const q = pageQuery(
			opts.pageSize,
			opts.after,
			opts.search,
			opts.categoryId,
			opts.feeId
		);
		return onSnapshot(
			q,
			(snap) => {
				const docs = snap.docs;
				const hasNext = docs.length > opts.pageSize;
				const pageDocs = hasNext ? docs.slice(0, opts.pageSize) : docs;
				const mixes = pageDocs.map(mapDoc);
				const lastDoc = pageDocs[pageDocs.length - 1];
				opts.onResult({ mixes, lastDoc, hasNext });
			},
			opts.onError
		);
	}

	static async getById(id: string): Promise<AreaMixRow | null> {
		const ref = doc(db, "area_mix", id);
		const snap = await getDoc(ref);
		if (!snap.exists()) return null;
		return mapDoc(snap as any);
	}

	static async update(
		id: string,
		data: {
			name: string;
			categoryId?: string;
			notes?: string;
			shares: Record<string, number>;
			feeId?: string | null;
			feeName?: string | null;
		}
	) {
		validateShares(data.shares);
		const ref = doc(db, "area_mix", id);
		await updateDoc(ref, {
			name: data.name.trim(),
			nameLower: data.name.trim().toLowerCase(),
			categoryId: data.categoryId || "",
			notes: data.notes || "",
			shares: data.shares,
			feeId: data.feeId ?? null,
			feeName: data.feeName ?? null,
			feeNameLower: data.feeName ? String(data.feeName).toLowerCase() : null,
			updatedAt: new Date(),
		});
	}

	static async remove(id: string) {
		await deleteDoc(doc(db, "area_mix", id));
	}
}
