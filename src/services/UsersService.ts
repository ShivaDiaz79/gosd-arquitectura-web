import { auth, db } from "@/firebase/config";
import { ROLES } from "@/lib/constants/roles";
import { sendPasswordResetEmail } from "firebase/auth";
import {
	collection,
	query,
	orderBy,
	limit as fbLimit,
	onSnapshot,
	startAfter,
	QueryDocumentSnapshot,
	DocumentData,
	Timestamp,
	Query,
	updateDoc,
	doc,
	getDoc,
} from "firebase/firestore";

export type UserRow = {
	id: string;
	firstName?: string;
	lastName?: string;
	displayName?: string | null;
	email?: string | null;
	role?: string | null;
	roleLabel?: string | null;
	createdAt?: Date | null;
	photoURL?: string | null;
	updatedAt?: Date | null;
};

export type PageListenResult = {
	users: UserRow[];
	lastDoc?: QueryDocumentSnapshot<DocumentData>;
	hasNext: boolean;
};

function roleLabelFromKey(key?: string | null) {
	if (!key) return undefined;
	return (
		ROLES.find((r: { value: string; label: string }) => r.value === key)
			?.label ?? key
	);
}

export class UsersService {
	static toDate(val: any): Date | null {
		if (!val) return null;
		if (val instanceof Date) return val;
		if (val instanceof Timestamp) return val.toDate();
		const n = new Date(val);
		return isNaN(+n) ? null : n;
	}

	static mapDoc(d: QueryDocumentSnapshot<DocumentData>): UserRow {
		const data = d.data() || {};
		return {
			id: d.id,
			firstName: data.firstName,
			lastName: data.lastName,
			displayName: data.displayName,
			email: data.email ?? null,
			role: data.role ?? data.rol ?? null,
			roleLabel: data.roleLabel ?? data.role ?? null,
			photoURL: data.photoURL ?? null,
			createdAt: UsersService.toDate(data.createdAt),
		};
	}

	static pageQuery(
		pageSize: number,
		after?: QueryDocumentSnapshot<DocumentData>
	): Query<DocumentData> {
		const col = collection(db, "users");
		const base = query(col, orderBy("createdAt", "desc"));
		return after
			? query(base, startAfter(after), fbLimit(pageSize + 1))
			: query(base, fbLimit(pageSize + 1));
	}

	/**
	 * Suscripción en tiempo real a una página.
	 * Devuelve la función `unsubscribe`.
	 */
	static listenPage(opts: {
		pageSize: number;
		after?: QueryDocumentSnapshot<DocumentData>;
		onResult: (res: PageListenResult) => void;
		onError?: (e: any) => void;
	}): () => void {
		const q = UsersService.pageQuery(opts.pageSize, opts.after);
		return onSnapshot(
			q,
			(snap) => {
				const docs = snap.docs;
				const hasNext = docs.length > opts.pageSize;
				const pageDocs = hasNext ? docs.slice(0, opts.pageSize) : docs;
				const users = pageDocs.map(UsersService.mapDoc);
				const lastDoc = pageDocs[pageDocs.length - 1];
				opts.onResult({ users, lastDoc, hasNext });
			},
			opts.onError
		);
	}

	static async sendResetEmail(email: string) {
		await sendPasswordResetEmail(auth, email);
	}

	static async setPassword(uid: string, newPassword: string) {
		const token = await auth.currentUser?.getIdToken();
		if (!token) throw new Error("No hay sesión válida");
		const res = await fetch(`/api/admin/users/${uid}`, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({ password: newPassword }),
		});
		if (!res.ok) throw new Error("No se pudo cambiar la contraseña");
	}

	static async deleteUser(uid: string) {
		const token = await auth.currentUser?.getIdToken();
		if (!token) throw new Error("No hay sesión válida");
		const res = await fetch(`/api/admin/users/${uid}`, {
			method: "DELETE",
			headers: { Authorization: `Bearer ${token}` },
		});
		if (!res.ok) throw new Error("No se pudo eliminar el usuario");
	}

	static async getById(userId: string): Promise<UserRow | null> {
		const ref = doc(db, "users", userId);
		const snap = await getDoc(ref);
		if (!snap.exists()) return null;
		const data = snap.data() as any;

		const createdAt =
			data.createdAt instanceof Timestamp
				? data.createdAt.toDate()
				: data.createdAt ?? null;
		const updatedAt =
			data.updatedAt instanceof Timestamp
				? data.updatedAt.toDate()
				: data.updatedAt ?? null;

		return {
			id: snap.id,
			firstName: data.firstName ?? null,
			lastName: data.lastName ?? null,
			email: data.email ?? null,
			displayName: data.displayName ?? null,
			photoURL: data.photoURL ?? null,
			role: data.rol || data.role || null,
			roleLabel:
				data.roleLabel || roleLabelFromKey(data.rol || data.role) || null,
			createdAt,
			updatedAt,
		};
	}

	static async updateUser(
		userId: string,
		data: {
			firstName: string;
			lastName: string;

			email?: string;
			roleKey: string;
		}
	): Promise<void> {
		const ref = doc(db, "users", userId);
		const roleLabel = roleLabelFromKey(data.roleKey) ?? data.roleKey;

		await updateDoc(ref, {
			firstName: data.firstName,
			lastName: data.lastName,

			...(data.email ? { email: data.email } : {}),
			role: data.roleKey,
			roleLabel,

			rol: data.roleKey,
			updatedAt: new Date(),

			displayName: `${data.firstName} ${data.lastName}`.trim(),
		});
	}
}
