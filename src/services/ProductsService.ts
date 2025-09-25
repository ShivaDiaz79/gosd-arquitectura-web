import { db, storage } from "@/firebase/config";
import {
	addDoc,
	collection,
	deleteDoc,
	doc,
	getDoc,
	onSnapshot,
	orderBy,
	query,
	startAfter,
	limit as fbLimit,
	updateDoc,
	Timestamp,
	where,
	getDocs,
} from "firebase/firestore";
import {
	getDownloadURL,
	ref as sref,
	uploadBytes,
	deleteObject,
} from "firebase/storage";
import type {
	ProductRow,
	ProductImage,
	ProductVariant,
	ProductCategory,
} from "@/lib/types/product.type";
import { QueryDocumentSnapshot, DocumentData } from "firebase/firestore";

export type ProductsPage = {
	products: ProductRow[];
	lastDoc?: QueryDocumentSnapshot<DocumentData>;
	hasNext: boolean;
};

function toDate(v: any) {
	if (!v) return null;
	if (v instanceof Date) return v;
	if (v instanceof Timestamp) return v.toDate();
	const d = new Date(v);
	return isNaN(+d) ? null : d;
}

function mapDoc(d: QueryDocumentSnapshot<DocumentData>): ProductRow {
	const x = d.data() || {};
	return {
		id: d.id,
		title: x.title || "",
		slug: x.slug || "",
		description: x.description || "",
		shortDescription: x.shortDescription || "",
		categories: Array.isArray(x.categories) ? x.categories : [],
		sku: x.sku || "",
		price: Number(x.price || 0),
		compareAtPrice: x.compareAtPrice ?? null,
		stock: Number(x.stock ?? 0),
		images: Array.isArray(x.images) ? x.images : [],
		attributes: x.attributes || {},
		hasVariants: !!x.hasVariants,
		variants: Array.isArray(x.variants) ? x.variants : [],
		featured: !!x.featured,
		status: (x.status as any) ?? "draft",
		createdAt: toDate(x.createdAt),
		updatedAt: toDate(x.updatedAt),
	};
}

async function uploadImages(
	productId: string,
	files: File[]
): Promise<ProductImage[]> {
	const out: ProductImage[] = [];
	for (const f of files) {
		const path = `products/${productId}/${Date.now()}-${f.name}`;
		const ref = sref(storage, path);
		await uploadBytes(ref, f);
		const url = await getDownloadURL(ref);
		out.push({ url, path, name: f.name });
	}
	return out;
}

export class ProductsService {
	static async createCategory(data: {
		name: string;
		slug: string;
		description?: string;
		parentId?: string | null;
	}) {
		const ref = await addDoc(collection(db, "productCategories"), {
			name: data.name.trim(),
			slug: data.slug.trim(),
			description: (data.description || "").trim(),
			parentId: data.parentId || null,
			createdAt: new Date(),
			updatedAt: new Date(),
		});
		return { id: ref.id };
	}
	static async listCategories(): Promise<ProductCategory[]> {
		const snap = await getDocs(
			query(collection(db, "productCategories"), orderBy("name"))
		);
		return snap.docs.map((d) => {
			const x = d.data() || {};
			return {
				id: d.id,
				name: x.name || "",
				slug: x.slug || "",
				parentId: x.parentId || null,
				description: x.description || "",
				createdAt: toDate(x.createdAt),
				updatedAt: toDate(x.updatedAt),
			};
		});
	}

	static listenPage(opts: {
		pageSize: number;
		after?: QueryDocumentSnapshot<DocumentData>;
		categoryId?: string;
		onResult: (res: ProductsPage) => void;
		onError?: (e: any) => void;
	}) {
		const col = collection(db, "products");
		let base = query(col, orderBy("createdAt", "desc"));

		if (opts.categoryId)
			base = query(
				col,
				where("categories", "array-contains", opts.categoryId),
				orderBy("createdAt", "desc")
			);
		const q = opts.after
			? query(base, startAfter(opts.after), fbLimit(opts.pageSize + 1))
			: query(base, fbLimit(opts.pageSize + 1));
		return onSnapshot(
			q,
			(snap) => {
				const docs = snap.docs;
				const hasNext = docs.length > opts.pageSize;
				const pageDocs = hasNext ? docs.slice(0, opts.pageSize) : docs;
				const products = pageDocs.map(mapDoc);
				const lastDoc = pageDocs[pageDocs.length - 1];
				opts.onResult({ products, lastDoc, hasNext });
			},
			opts.onError
		);
	}

	static async getById(id: string): Promise<ProductRow | null> {
		const ref = doc(db, "products", id);
		const snap = await getDoc(ref);
		if (!snap.exists()) return null;
		return mapDoc(snap as any);
	}

	static async create(data: {
		title: string;
		slug: string;
		description?: string;
		shortDescription?: string;
		categories: string[];
		sku?: string;
		price: number;
		compareAtPrice?: number | null;
		stock: number;
		featured?: boolean;
		status?: "draft" | "published";
		attributes?: Record<string, string[]>;
		hasVariants?: boolean;
		variants?: ProductVariant[];
		files?: File[];
	}) {
		const ref = await addDoc(collection(db, "products"), {
			title: data.title.trim(),
			slug: data.slug.trim(),
			description: (data.description || "").trim(),
			shortDescription: (data.shortDescription || "").trim(),
			categories: data.categories || [],
			sku: (data.sku || "").trim(),
			price: Number(data.price || 0),
			compareAtPrice: data.compareAtPrice ?? null,
			stock: Number(data.stock || 0),
			images: [],
			attributes: data.attributes || {},
			hasVariants: !!data.hasVariants,
			variants: (data.variants || []).map((v) => ({
				...v,
				price: Number(v.price),
				stock: Number(v.stock),
			})),
			featured: !!data.featured,
			status: data.status || "draft",
			createdAt: new Date(),
			updatedAt: new Date(),
		});

		if (data.files?.length) {
			const imgs = await uploadImages(ref.id, data.files);
			await updateDoc(ref, { images: imgs, updatedAt: new Date() });
		}

		return { id: ref.id };
	}

	static async update(
		id: string,
		data: {
			title: string;
			slug: string;
			description?: string;
			shortDescription?: string;
			categories: string[];
			sku?: string;
			price: number;
			compareAtPrice?: number | null;
			stock: number;
			featured?: boolean;
			status?: "draft" | "published";
			attributes?: Record<string, string[]>;
			hasVariants?: boolean;
			variants?: ProductVariant[];
			addFiles?: File[];
			removePaths?: string[];
		}
	) {
		const ref = doc(db, "products", id);
		const snap = await getDoc(ref);
		if (!snap.exists()) throw new Error("Producto no encontrado");
		const x = snap.data() as any;
		let images: ProductImage[] = Array.isArray(x.images) ? x.images : [];

		if (data.removePaths?.length) {
			const rm = new Set(data.removePaths);
			const todel = images.filter((i) => rm.has(i.path));
			await Promise.allSettled(
				todel.map((i) => deleteObject(sref(storage, i.path)))
			);
			images = images.filter((i) => !rm.has(i.path));
		}
		if (data.addFiles?.length) {
			const newImgs = await uploadImages(id, data.addFiles);
			images = [...images, ...newImgs];
		}

		await updateDoc(ref, {
			title: data.title.trim(),
			slug: data.slug.trim(),
			description: (data.description || "").trim(),
			shortDescription: (data.shortDescription || "").trim(),
			categories: data.categories || [],
			sku: (data.sku || "").trim(),
			price: Number(data.price || 0),
			compareAtPrice: data.compareAtPrice ?? null,
			stock: Number(data.stock || 0),
			images,
			attributes: data.attributes || {},
			hasVariants: !!data.hasVariants,
			variants: (data.variants || []).map((v) => ({
				...v,
				price: Number(v.price),
				stock: Number(v.stock),
			})),
			featured: !!data.featured,
			status: data.status || "draft",
			updatedAt: new Date(),
		});
	}

	static async remove(id: string) {
		const ref = doc(db, "products", id);
		const snap = await getDoc(ref);
		if (snap.exists()) {
			const imgs: ProductImage[] = Array.isArray(snap.data()?.images)
				? snap.data()!.images
				: [];
			await Promise.allSettled(
				imgs.map((i) => deleteObject(sref(storage, i.path)))
			);
		}
		await deleteDoc(ref);
	}
}
