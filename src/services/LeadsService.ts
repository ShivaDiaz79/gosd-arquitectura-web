"use client";
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
	startAfter,
	updateDoc,
	where,
	writeBatch,
	DocumentSnapshot,
	Timestamp,
} from "firebase/firestore";
import type {
	LeadDoc,
	LeadFormValues,
	ListParams,
	ListResult,
} from "@/lib/types/leads";
import { getCountFromServer } from "firebase/firestore";
import { db } from "@/firebase/config";

const COL = "leads";

export class LeadsService {
	static colRef() {
		return collection(db, COL);
	}

	static async create(data: LeadFormValues): Promise<string> {
		const now = serverTimestamp();
		const payload = {
			...data,
			createdAt: now,
			updatedAt: now,
			deletedAt: null as Timestamp | null,
			nombreLower: (data.nombreCompleto || "").toLowerCase(),
		};
		const ref = await addDoc(this.colRef(), payload);
		return ref.id;
	}

	static async getById(id: string): Promise<LeadDoc | null> {
		const ref = doc(db, COL, id);
		const snap = await getDoc(ref);
		if (!snap.exists()) return null;
		return { id: snap.id, ...(snap.data() as any) };
	}

	static async update(
		id: string,
		data: Partial<LeadFormValues>
	): Promise<void> {
		const ref = doc(db, COL, id);
		const payload: any = {
			...data,
			updatedAt: serverTimestamp(),
		};
		if (data.nombreCompleto !== undefined) {
			payload.nombreLower = (data.nombreCompleto || "").toLowerCase();
		}
		await updateDoc(ref, payload);
	}

	static async softDelete(id: string): Promise<void> {
		const ref = doc(db, COL, id);
		await updateDoc(ref, {
			deletedAt: serverTimestamp(),
			updatedAt: serverTimestamp(),
		});
	}

	static async restore(id: string): Promise<void> {
		const ref = doc(db, COL, id);
		await updateDoc(ref, {
			deletedAt: null,
			updatedAt: serverTimestamp(),
		});
	}

	static async hardDelete(id: string): Promise<void> {
		const ref = doc(db, COL, id);

		const batch = writeBatch(db);
		batch.delete(ref);
		await batch.commit();
	}

	static async list(params: ListParams = {}): Promise<ListResult> {
		const {
			pageSize = 10,
			cursor = null,
			includeDeleted = false,
			estado,
			servicio,
			fuente,
			searchPrefix,
			orderByField = "createdAt",
			orderDir = "desc",
		} = params;

		const constraints: any[] = [];

		if (!includeDeleted) {
			constraints.push(where("deletedAt", "==", null));
		}

		if (estado) constraints.push(where("estado", "==", estado));
		if (servicio) constraints.push(where("servicio", "==", servicio));
		if (fuente) constraints.push(where("fuente", "==", fuente));

		if (searchPrefix && searchPrefix.trim()) {
			const sp = searchPrefix.trim().toLowerCase();
			constraints.push(orderBy("nombreLower", "asc"));
			constraints.push(where("nombreLower", ">=", sp));
			constraints.push(where("nombreLower", "<", sp + "\uf8ff"));
		} else {
			constraints.push(orderBy(orderByField, orderDir));
		}

		if (cursor) constraints.push(startAfter(cursor));
		constraints.push(limit(pageSize));

		const q = query(this.colRef(), ...constraints);
		const snap = await getDocs(q);

		const items = snap.docs.map((d) => ({
			id: d.id,
			...(d.data() as any),
		})) as LeadDoc[];
		const nextCursor: DocumentSnapshot | null = snap.docs.length
			? snap.docs[snap.docs.length - 1]
			: null;

		let total: number | undefined = undefined;
		try {
			const countConstraints = constraints.filter(
				(c) => c.type !== "limit" && c.type !== "startAfter"
			);
			const qCount = query(this.colRef(), ...countConstraints);
			const agg = await getCountFromServer(qCount);
			total = agg.data().count;
		} catch {}

		return { items, nextCursor, total };
	}
}
