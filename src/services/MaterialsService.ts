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
import type {
	MaterialRow,
	MaterialImage,
	InventoryMovement,
} from "@/lib/types/material.type";

export type PageListenResult = {
	materials: MaterialRow[];
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

function mapDoc(d: QueryDocumentSnapshot<DocumentData>): MaterialRow {
	const data = d.data() || {};
	return {
		id: d.id,
		description: data.description || "",
		unit: data.unit || "",
		priceBs: Number(data.priceBs) || 0,
		priceUsd: Number(data.priceUsd) || 0,
		stock: Number(data.stock) || 0,
		minStock: typeof data.minStock === "number" ? data.minStock : undefined,
		images: Array.isArray(data.images) ? data.images : [],
		createdAt: toDate(data.createdAt),
		updatedAt: toDate(data.updatedAt),
	};
}

async function uploadImages(
	materialId: string,
	files: File[]
): Promise<MaterialImage[]> {
	const uploaded: MaterialImage[] = [];
	for (const file of files) {
		const path = `materials/${materialId}/${Date.now()}-${file.name}`;
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
	const col = collection(db, "materials");
	const s = (search || "").trim().toLowerCase();

	if (s) {
		const base = query(col, orderBy("descriptionLower"));
		const start = s;

		const end = s + "\uf8ff";
		const withBounds = query(
			base,
			where("descriptionLower", ">=", start),
			where("descriptionLower", "<=", end),
			fbLimit(pageSize + 1)
		);
		return after ? query(withBounds, startAfter(after)) : withBounds;
	}

	const base = query(col, orderBy("createdAt", "desc"));
	return after
		? query(base, startAfter(after), fbLimit(pageSize + 1))
		: query(base, fbLimit(pageSize + 1));
}

export class MaterialsService {
	static async create(data: {
		description: string;
		unit: string;
		priceBs: number;
		priceUsd: number;
		minStock?: number;
		files?: File[];
	}): Promise<{ id: string }> {
		const col = collection(db, "materials");
		const base = await addDoc(col, {
			description: data.description.trim(),
			descriptionLower: data.description.trim().toLowerCase(),
			unit: data.unit.trim(),
			priceBs: Number(data.priceBs) || 0,
			priceUsd: Number(data.priceUsd) || 0,
			stock: 0,
			minStock: typeof data.minStock === "number" ? data.minStock : null,
			images: [],
			createdAt: new Date(),
			updatedAt: new Date(),
		});

		if (data.files?.length) {
			const imgs = await uploadImages(base.id, data.files);
			await updateDoc(base, { images: imgs, updatedAt: new Date() });
		}

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
				const materials = pageDocs.map(mapDoc);
				const lastDoc = pageDocs[pageDocs.length - 1];
				opts.onResult({ materials, lastDoc, hasNext });
			},
			opts.onError
		);
	}

	static async getById(id: string): Promise<MaterialRow | null> {
		const ref = doc(db, "materials", id);
		const snap = await getDoc(ref);
		if (!snap.exists()) return null;
		const data = snap.data() as any;
		return {
			id: snap.id,
			description: data.description || "",
			unit: data.unit || "",
			priceBs: Number(data.priceBs) || 0,
			priceUsd: Number(data.priceUsd) || 0,
			stock: Number(data.stock) || 0,
			minStock: typeof data.minStock === "number" ? data.minStock : undefined,
			images: Array.isArray(data.images) ? data.images : [],
			createdAt: toDate(data.createdAt),
			updatedAt: toDate(data.updatedAt),
		};
	}

	static async update(
		id: string,
		data: {
			description: string;
			unit: string;
			priceBs: number;
			priceUsd: number;
			minStock?: number | null;
			addFiles?: File[];
			removePaths?: string[];
		}
	) {
		const refDoc = doc(db, "materials", id);
		const snap = await getDoc(refDoc);
		if (!snap.exists()) throw new Error("Material no encontrado");
		const curr = snap.data() as any;
		let images: MaterialImage[] = Array.isArray(curr.images) ? curr.images : [];

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
			description: data.description.trim(),
			descriptionLower: data.description.trim().toLowerCase(),
			unit: data.unit.trim(),
			priceBs: Number(data.priceBs) || 0,
			priceUsd: Number(data.priceUsd) || 0,
			minStock:
				typeof data.minStock === "number" || data.minStock === null
					? data.minStock
					: null,
			images,
			updatedAt: new Date(),
		});
	}

	static async moveStock(
		materialId: string,
		opts: {
			type: "in" | "out" | "adjust";
			qty: number;
			note?: string;
			by?: string;
		}
	) {
		if (opts.qty <= 0) throw new Error("La cantidad debe ser mayor a cero");
		const ref = doc(db, "materials", materialId);
		const movementsCol = collection(ref, "movements");

		await runTransaction(db, async (tx) => {
			const snap = await tx.get(ref);
			if (!snap.exists()) throw new Error("Material no encontrado");
			const data = snap.data() as any;
			let stock = Number(data.stock) || 0;

			if (opts.type === "in") stock += opts.qty;
			else if (opts.type === "out") {
				if (stock - opts.qty < 0) throw new Error("Stock insuficiente");
				stock -= opts.qty;
			} else if (opts.type === "adjust") {
				stock = opts.qty;
			}

			tx.update(ref, { stock, updatedAt: serverTimestamp() });
			await tx.set(doc(movementsCol), {
				type: opts.type,
				qty: opts.qty,
				note: opts.note || null,
				by: opts.by || null,
				at: serverTimestamp(),
			});
		});
	}

	static async remove(id: string) {
		const refDoc = doc(db, "materials", id);
		const snap = await getDoc(refDoc);
		if (snap.exists()) {
			const data = snap.data() as any;
			const imgs: MaterialImage[] = Array.isArray(data.images)
				? data.images
				: [];
			await Promise.allSettled(
				imgs.map((i) => deleteObject(storageRef(storage, i.path)))
			);
		}
		await deleteDoc(refDoc);
	}
}
