// src/services/ProjectsService.ts
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
} from "firebase/firestore";
import {
	getDownloadURL,
	ref as storageRef,
	uploadBytes,
	deleteObject,
} from "firebase/storage";
import { storage } from "@/firebase/config";
import type { ProjectRow, ProjectImage } from "@/lib/types/project.type";

export type PageListenResult = {
	projects: ProjectRow[];
	lastDoc?: QueryDocumentSnapshot<DocumentData>;
	hasNext: boolean;
};

function toDate(val: any): Date | null {
	if (!val) return null;
	if (val instanceof Date) return val;
	if (val instanceof Timestamp) return val.toDate();
	const n = new Date(val);
	return isNaN(+n) ? null : n;
}

function mapDoc(d: QueryDocumentSnapshot<DocumentData>): ProjectRow {
	const data = d.data() || {};
	return {
		id: d.id,
		title: data.title || "",
		description: data.description || "",
		images: Array.isArray(data.images) ? data.images : [],
		createdAt: toDate(data.createdAt),
		updatedAt: toDate(data.updatedAt),
	};
}

function pageQuery(
	pageSize: number,
	after?: QueryDocumentSnapshot<DocumentData>
): Query<DocumentData> {
	const col = collection(db, "projects");
	const base = query(col, orderBy("createdAt", "desc"));
	return after
		? query(base, startAfter(after), fbLimit(pageSize + 1))
		: query(base, fbLimit(pageSize + 1));
}

async function uploadImages(
	projectId: string,
	files: File[]
): Promise<ProjectImage[]> {
	const uploaded: ProjectImage[] = [];
	for (const file of files) {
		const path = `projects/${projectId}/${Date.now()}-${file.name}`;
		const ref = storageRef(storage, path);
		await uploadBytes(ref, file);
		const url = await getDownloadURL(ref);
		uploaded.push({ url, path, name: file.name });
	}
	return uploaded;
}

export class ProjectsService {
	// CREATE
	static async create(data: {
		title: string;
		description: string;
		files?: File[];
	}): Promise<{ id: string }> {
		const col = collection(db, "projects");
		const base = await addDoc(col, {
			title: data.title.trim(),
			description: data.description.trim(),
			images: [],
			createdAt: new Date(),
			updatedAt: new Date(),
		});

		if (data.files && data.files.length) {
			const imgs = await uploadImages(base.id, data.files);
			await updateDoc(base, { images: imgs, updatedAt: new Date() });
		}

		return { id: base.id };
	}

	// READ (page listener)
	static listenPage(opts: {
		pageSize: number;
		after?: QueryDocumentSnapshot<DocumentData>;
		onResult: (res: PageListenResult) => void;
		onError?: (e: any) => void;
	}): () => void {
		const q = pageQuery(opts.pageSize, opts.after);
		return onSnapshot(
			q,
			(snap) => {
				const docs = snap.docs;
				const hasNext = docs.length > opts.pageSize;
				const pageDocs = hasNext ? docs.slice(0, opts.pageSize) : docs;
				const projects = pageDocs.map(mapDoc);
				const lastDoc = pageDocs[pageDocs.length - 1];
				opts.onResult({ projects, lastDoc, hasNext });
			},
			opts.onError
		);
	}

	// READ (single)
	static async getById(id: string): Promise<ProjectRow | null> {
		const ref = doc(db, "projects", id);
		const snap = await getDoc(ref);
		if (!snap.exists()) return null;
		const data = snap.data() as any;
		return {
			id: snap.id,
			title: data.title || "",
			description: data.description || "",
			images: Array.isArray(data.images) ? data.images : [],
			createdAt: toDate(data.createdAt),
			updatedAt: toDate(data.updatedAt),
		};
	}

	// UPDATE (permite agregar y quitar imágenes)
	static async update(
		id: string,
		data: {
			title: string;
			description: string;
			addFiles?: File[];
			removePaths?: string[]; // paths de Storage a borrar
		}
	) {
		const refDoc = doc(db, "projects", id);
		const snap = await getDoc(refDoc);
		if (!snap.exists()) throw new Error("Proyecto no encontrado");
		const curr = snap.data() as any;
		let images: ProjectImage[] = Array.isArray(curr.images) ? curr.images : [];

		// eliminar imágenes marcadas
		if (data.removePaths?.length) {
			const removeSet = new Set(data.removePaths);
			const toDelete = images.filter((i) => removeSet.has(i.path));
			// borrar de Storage
			await Promise.allSettled(
				toDelete.map((i) => deleteObject(storageRef(storage, i.path)))
			);
			images = images.filter((i) => !removeSet.has(i.path));
		}

		// subir nuevas
		if (data.addFiles?.length) {
			const newImgs = await uploadImages(id, data.addFiles);
			images = [...images, ...newImgs];
		}

		await updateDoc(refDoc, {
			title: data.title.trim(),
			description: data.description.trim(),
			images,
			updatedAt: new Date(),
		});
	}

	// DELETE (borra doc + imágenes en Storage)
	static async remove(id: string) {
		const refDoc = doc(db, "projects", id);
		const snap = await getDoc(refDoc);
		if (snap.exists()) {
			const data = snap.data() as any;
			const imgs: ProjectImage[] = Array.isArray(data.images)
				? data.images
				: [];
			await Promise.allSettled(
				imgs.map((i) => deleteObject(storageRef(storage, i.path)))
			);
		}
		await deleteDoc(refDoc);
	}
}
