import {
	collection,
	addDoc,
	doc,
	updateDoc,
	deleteDoc,
	onSnapshot,
	query,
	orderBy,
	serverTimestamp,
	type Unsubscribe,
} from "firebase/firestore";

import type { EventInput } from "@fullcalendar/core";
import { db } from "@/firebase/config";
import { useAuthStore } from "@/stores/useAuthStore";

export type CalendarCategory = "danger" | "success" | "primary" | "warning";

export interface DbEvent {
	title: string;
	start: string;
	end?: string | null;
	allDay?: boolean;
	calendar: CalendarCategory;
	createdAt?: any;
	updatedAt?: any;
}

export interface CalendarEvent extends EventInput {
	id: string;
	title: string;
	start: string;
	end?: string;
	allDay?: boolean;
	extendedProps: { calendar: CalendarCategory };
}

function ensureUid(providedUid?: string): string {
	const uid = providedUid ?? useAuthStore.getState().user?.uid;
	if (!uid) throw new Error("No hay UID de usuario disponible.");
	return uid;
}
function eventsCollection(uid: string) {
	return collection(db, "users", uid, "events");
}

export class CalendarService {
	static subscribe(
		handler: (events: CalendarEvent[]) => void,
		opts?: { uid?: string; order?: "asc" | "desc" }
	): Unsubscribe {
		const uid = ensureUid(opts?.uid);
		const q = query(
			eventsCollection(uid),
			orderBy("start", opts?.order ?? "asc")
		);

		return onSnapshot(q, (snap) => {
			const events: CalendarEvent[] = snap.docs.map((d) => {
				const data = d.data() as DbEvent;
				return {
					id: d.id,
					title: data.title,
					start: data.start,
					end: data.end ?? undefined,
					allDay: data.allDay ?? true,
					extendedProps: {
						calendar: (data.calendar ?? "primary") as CalendarCategory,
					},
				};
			});
			handler(events);
		});
	}

	static async create(
		event: Omit<DbEvent, "createdAt" | "updatedAt">,
		uidOpt?: string
	) {
		const uid = ensureUid(uidOpt);
		const payload: DbEvent = {
			...event,
			allDay: event.allDay ?? true,
			end: event.end ?? null,
			createdAt: serverTimestamp(),
			updatedAt: serverTimestamp(),
		};
		const ref = await addDoc(eventsCollection(uid), payload);
		return ref.id;
	}

	static async update(
		id: string,
		patch: Partial<Omit<DbEvent, "createdAt">>,
		uidOpt?: string
	) {
		const uid = ensureUid(uidOpt);
		const ref = doc(db, "users", uid, "events", id);
		const payload = { ...patch, updatedAt: serverTimestamp() };
		await updateDoc(ref, payload as any);
	}

	static async delete(id: string, uidOpt?: string) {
		const uid = ensureUid(uidOpt);
		const ref = doc(db, "users", uid, "events", id);
		await deleteDoc(ref);
	}
}
