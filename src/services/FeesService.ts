import { db } from "@/firebase/config";
import {
	addDoc,
	collection,
	deleteDoc,
	doc,
	getDoc,
	getDocs,
	onSnapshot,
	orderBy,
	query,
	updateDoc,
	Timestamp,
	QueryDocumentSnapshot,
	DocumentData,
	startAfter,
	limit as fbLimit,
} from "firebase/firestore";

import type { FeeRow, FeeRange } from "@/lib/types/fee.type";

export type FeesPage = {
	fees: FeeRow[];
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

function mapDoc(d: QueryDocumentSnapshot<DocumentData>): FeeRow {
	const data = d.data() || {};
	return {
		id: d.id,
		name: String(data.name || ""),
		note: data.note || "",
		ranges: Array.isArray(data.ranges) ? data.ranges : [],
		createdAt: toDate(data.createdAt),
		updatedAt: toDate(data.updatedAt),
	};
}

function pageQuery(
	pageSize: number,
	after?: QueryDocumentSnapshot<DocumentData>
) {
	const col = collection(db, "fees");
	const base = query(col, orderBy("createdAt", "desc"));
	return after
		? query(base, startAfter(after), fbLimit(pageSize + 1))
		: query(base, fbLimit(pageSize + 1));
}

export class FeesService {
	static async create(data: {
		name: string;
		note?: string;
		ranges: FeeRange[];
	}) {
		const col = collection(db, "fees");
		const ref = await addDoc(col, {
			name: data.name.trim(),
			note: (data.note || "").trim(),
			ranges: (data.ranges || []).map((r) => ({
				from: Number(r.from),
				to: r.to === null ? null : Number(r.to),
				price: Number(r.price),
			})),
			createdAt: new Date(),
			updatedAt: new Date(),
		});
		return { id: ref.id };
	}

	static listenPage(opts: {
		pageSize: number;
		after?: QueryDocumentSnapshot<DocumentData>;
		onResult: (res: FeesPage) => void;
		onError?: (e: any) => void;
	}) {
		const q = pageQuery(opts.pageSize, opts.after);
		return onSnapshot(
			q,
			(snap) => {
				const docs = snap.docs;
				const hasNext = docs.length > opts.pageSize;
				const pageDocs = hasNext ? docs.slice(0, opts.pageSize) : docs;
				const fees = pageDocs.map(mapDoc);
				const lastDoc = pageDocs[pageDocs.length - 1];
				opts.onResult({ fees, lastDoc, hasNext });
			},
			opts.onError
		);
	}

	static async getById(id: string): Promise<FeeRow | null> {
		const ref = doc(db, "fees", id);
		const snap = await getDoc(ref);
		if (!snap.exists()) return null;
		return mapDoc(snap as any);
	}

	static async update(
		id: string,
		data: { name: string; note?: string; ranges: FeeRange[] }
	) {
		const ref = doc(db, "fees", id);
		await updateDoc(ref, {
			name: data.name.trim(),
			note: (data.note || "").trim(),
			ranges: data.ranges.map((r) => ({
				from: Number(r.from),
				to: r.to === null ? null : Number(r.to),
				price: Number(r.price),
			})),
			updatedAt: new Date(),
		});
	}

	static async remove(id: string) {
		await deleteDoc(doc(db, "fees", id));
	}
}
