import { db, storage } from "@/firebase/config";
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
	runTransaction,
	serverTimestamp,
} from "firebase/firestore";
import {
	getDownloadURL,
	ref as storageRef,
	uploadBytes,
	deleteObject,
} from "firebase/storage";
import type { ToolRow, ToolImage } from "@/lib/types/tool.type";

export type PageListenResult = {
	tools: ToolRow[];
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

function mapDoc(d: QueryDocumentSnapshot<DocumentData>): ToolRow {
	const data = d.data() || {};
	return {
		id: d.id,
		name: data.name || "",
		code: data.code || "",
		category: data.category || "",
		unit: data.unit || "und",
		stock: Number(data.stock) || 0,
		minStock: typeof data.minStock === "number" ? data.minStock : undefined,
		location: data.location || "",
		images: Array.isArray(data.images) ? data.images : [],
		createdAt: toDate(data.createdAt),
		updatedAt: toDate(data.updatedAt),
	};
}

async function uploadImages(
	toolId: string,
	files: File[]
): Promise<ToolImage[]> {
	const uploaded: ToolImage[] = [];
	for (const file of files) {
		const path = `tools/${toolId}/${Date.now()}-${file.name}`;
		const ref = storageRef(storage, path);
		await uploadBytes(ref, file);
		const url = await getDownloadURL(ref);
		uploaded.push({ url, path, name: file.name });
	}
	return uploaded;
}

function pageQuery(
	pageSize: number,
	after?: QueryDocumentSnapshot<DocumentData>,
	search?: string
): Query<DocumentData> {
	const col = collection(db, "tools");
	const s = (search || "").trim().toLowerCase();

	if (s) {
		const base = query(col, orderBy("nameLower"));
		const start = s;
		const end = s + "\uf8ff";
		const q1 = query(
			base,
			where("nameLower", ">=", start),
			where("nameLower", "<=", end),
			fbLimit(pageSize + 1)
		);
		return after ? query(q1, startAfter(after)) : q1;
	}

	const base = query(col, orderBy("createdAt", "desc"));
	return after
		? query(base, startAfter(after), fbLimit(pageSize + 1))
		: query(base, fbLimit(pageSize + 1));
}

export class ToolsService {
	static async create(data: {
		name: string;
		code?: string;
		category?: string;
		unit: string;
		minStock?: number;
		location?: string;
		files?: File[];
	}): Promise<{ id: string }> {
		const col = collection(db, "tools");
		const ref = await addDoc(col, {
			name: data.name.trim(),
			nameLower: data.name.trim().toLowerCase(),
			code: data.code?.trim() || "",
			codeLower: data.code?.trim().toLowerCase() || "",
			category: data.category?.trim() || "",
			unit: data.unit.trim() || "und",
			stock: 0,
			minStock: typeof data.minStock === "number" ? data.minStock : null,
			location: data.location || "",
			images: [],
			createdAt: new Date(),
			updatedAt: new Date(),
		});

		if (data.files?.length) {
			const imgs = await uploadImages(ref.id, data.files);
			await updateDoc(ref, { images: imgs, updatedAt: new Date() });
		}
		return { id: ref.id };
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
				const tools = pageDocs.map(mapDoc);
				const lastDoc = pageDocs[pageDocs.length - 1];
				opts.onResult({ tools, lastDoc, hasNext });
			},
			opts.onError
		);
	}

	static async getById(id: string): Promise<ToolRow | null> {
		const ref = doc(db, "tools", id);
		const snap = await getDoc(ref);
		if (!snap.exists()) return null;
		return mapDoc(snap as any);
	}

	static async update(
		id: string,
		data: {
			name: string;
			code?: string;
			category?: string;
			unit: string;
			minStock?: number | null;
			location?: string;
			addFiles?: File[];
			removePaths?: string[];
		}
	) {
		const refDoc = doc(db, "tools", id);
		const snap = await getDoc(refDoc);
		if (!snap.exists()) throw new Error("Herramienta no encontrada");
		const curr = snap.data() as any;
		let images: ToolImage[] = Array.isArray(curr.images) ? curr.images : [];

		if (data.removePaths?.length) {
			const rm = new Set(data.removePaths);
			const toDelete = images.filter((i) => rm.has(i.path));
			await Promise.allSettled(
				toDelete.map((i) => deleteObject(storageRef(storage, i.path)))
			);
			images = images.filter((i) => !rm.has(i.path));
		}
		if (data.addFiles?.length) {
			const newImgs = await uploadImages(id, data.addFiles);
			images = [...images, ...newImgs];
		}

		await updateDoc(refDoc, {
			name: data.name.trim(),
			nameLower: data.name.trim().toLowerCase(),
			code: data.code?.trim() || "",
			codeLower: data.code?.trim().toLowerCase() || "",
			category: data.category?.trim() || "",
			unit: data.unit.trim() || "und",
			minStock:
				typeof data.minStock === "number" || data.minStock === null
					? data.minStock
					: null,
			location: data.location || "",
			images,
			updatedAt: new Date(),
		});
	}

	static async moveStock(
		toolId: string,
		opts: {
			type: "in" | "out" | "adjust" | "issue" | "return";
			qty: number;
			note?: string;
			to?: string;
			by?: string;
		}
	) {
		if (opts.qty <= 0) throw new Error("La cantidad debe ser mayor a cero");
		const ref = doc(db, "tools", toolId);
		const moves = collection(ref, "movements");

		await runTransaction(db, async (tx) => {
			const snap = await tx.get(ref);
			if (!snap.exists()) throw new Error("Herramienta no encontrada");
			const data = snap.data() as any;
			let stock = Number(data.stock) || 0;

			if (opts.type === "in" || opts.type === "return") stock += opts.qty;
			else if (opts.type === "out" || opts.type === "issue") {
				if (stock - opts.qty < 0) throw new Error("Stock insuficiente");
				stock -= opts.qty;
			} else if (opts.type === "adjust") {
				stock = opts.qty;
			}

			tx.update(ref, { stock, updatedAt: serverTimestamp() });
			await tx.set(doc(moves), {
				type: opts.type,
				qty: opts.qty,
				note: opts.note || null,
				to: opts.to || null,
				by: opts.by || null,
				at: serverTimestamp(),
			});
		});
	}

	static async remove(id: string) {
		const refDoc = doc(db, "tools", id);
		const snap = await getDoc(refDoc);
		if (snap.exists()) {
			const data = snap.data() as any;
			const imgs: ToolImage[] = Array.isArray(data.images) ? data.images : [];
			await Promise.allSettled(
				imgs.map((i) => deleteObject(storageRef(storage, i.path)))
			);
		}
		await deleteDoc(refDoc);
	}
}
