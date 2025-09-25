import { db } from "@/firebase/config";
import {
	addDoc,
	collection,
	deleteDoc,
	doc,
	getDoc,
	onSnapshot,
	orderBy,
	query,
	updateDoc,
	Timestamp,
	startAfter,
	limit as fbLimit,
	QueryDocumentSnapshot,
	DocumentData,
} from "firebase/firestore";
import type { PlanRow } from "@/lib/types/plan.type";

export type PlansPage = {
	plans: PlanRow[];
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

function mapDoc(d: QueryDocumentSnapshot<DocumentData>): PlanRow {
	const data = d.data() || {};
	return {
		id: d.id,
		name: String(data.name || ""),
		price: Number(data.price || 0),
		note: data.note || "",
		createdAt: toDate(data.createdAt),
		updatedAt: toDate(data.updatedAt),
	};
}

export class PlansService {
	static listenPage(opts: {
		pageSize: number;
		after?: QueryDocumentSnapshot<DocumentData>;
		onResult: (res: PlansPage) => void;
		onError?: (e: any) => void;
	}) {
		const col = collection(db, "plans");
		const base = query(col, orderBy("createdAt", "desc"));
		const q = opts.after
			? query(base, startAfter(opts.after), fbLimit(opts.pageSize + 1))
			: query(base, fbLimit(opts.pageSize + 1));

		return onSnapshot(
			q,
			(snap) => {
				const docs = snap.docs;
				const hasNext = docs.length > opts.pageSize;
				const pageDocs = hasNext ? docs.slice(0, opts.pageSize) : docs;
				const plans = pageDocs.map(mapDoc);
				const lastDoc = pageDocs[pageDocs.length - 1];
				opts.onResult({ plans, lastDoc, hasNext });
			},
			opts.onError
		);
	}

	static async getById(id: string): Promise<PlanRow | null> {
		const ref = doc(db, "plans", id);
		const snap = await getDoc(ref);
		if (!snap.exists()) return null;
		return mapDoc(snap as any);
	}

	static async create(data: { name: string; price: number; note?: string }) {
		const col = collection(db, "plans");
		const ref = await addDoc(col, {
			name: data.name.trim(),
			price: Number(data.price),
			note: (data.note || "").trim(),
			createdAt: new Date(),
			updatedAt: new Date(),
		});
		return { id: ref.id };
	}

	static async update(
		id: string,
		data: { name: string; price: number; note?: string }
	) {
		const ref = doc(db, "plans", id);
		await updateDoc(ref, {
			name: data.name.trim(),
			price: Number(data.price),
			note: (data.note || "").trim(),
			updatedAt: new Date(),
		});
	}

	static async remove(id: string) {
		await deleteDoc(doc(db, "plans", id));
	}
}
