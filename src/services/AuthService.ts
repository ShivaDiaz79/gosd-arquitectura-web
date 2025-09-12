import { auth, db } from "@/firebase/config";
import {
	onAuthStateChanged,
	signInWithEmailAndPassword,
	signOut as fbSignOut,
	User as FirebaseUser,
	createUserWithEmailAndPassword,
	updateProfile,
	getAuth,
} from "firebase/auth";
import { doc, getDoc, setDoc, getFirestore } from "firebase/firestore";
import { initializeApp, getApps } from "firebase/app";

export interface UserSimple {
	uid: string;
	email: string | null;
	displayName: string | null;
	photoURL: string | null;
}

export interface Profile {
	role: string;
	roleLabel?: string;
	[key: string]: any;
}

export type RoleKey =
	| "project_manager"
	| "sales"
	| "technical"
	| "admin_finance"
	| "legal"
	| "client";

export const ROLES: { key: RoleKey; label: string }[] = [
	{ key: "project_manager", label: "Gerente de proyectos / Director de obra" },
	{ key: "sales", label: "Equipo de ventas / Comercial" },
	{ key: "technical", label: "Área técnica / Ingenieros - Arquitectos" },
	{ key: "admin_finance", label: "Área administrativa / Finanzas" },
	{ key: "legal", label: "Legal" },
	{ key: "client", label: "Cliente (rol externo, opcional)" },
];

function getSecondary() {
	const name = "Secondary";
	const existing = getApps().find((a) => a.name === name);
	const app = existing ?? initializeApp(auth.app.options, name);
	return {
		auth: getAuth(app),
		db: getFirestore(app),
	};
}

export const authService = {
	toSimpleUser(user: FirebaseUser): UserSimple {
		return {
			uid: user.uid,
			email: user.email,
			displayName: user.displayName,
			photoURL: user.photoURL,
		};
	},

	onAuthStateChange(callback: (user: FirebaseUser | null) => void) {
		return onAuthStateChanged(auth, callback);
	},

	async signIn(email: string, password: string): Promise<FirebaseUser> {
		const cred = await signInWithEmailAndPassword(auth, email, password);
		return cred.user;
	},

	async signOut(): Promise<void> {
		await fbSignOut(auth);
	},

	async getProfile(uid: string): Promise<Profile> {
		const snap = await getDoc(doc(db, "users", uid));
		if (snap.exists()) {
			const data = snap.data() || {};
			return { role: (data.rol as string) || data.role || "user", ...data };
		}
		return { role: "user" };
	},

	async signUp(
		email: string,
		password: string,
		firstName: string,
		lastName: string,
		roleKey: RoleKey
	): Promise<UserSimple> {
		const { auth: secAuth, db: secDb } = getSecondary();
		const cred = await createUserWithEmailAndPassword(secAuth, email, password);

		await updateProfile(cred.user, {
			displayName: `${firstName} ${lastName}`,
		});

		const roleLabel = ROLES.find((r) => r.key === roleKey)?.label ?? roleKey;

		await setDoc(doc(secDb, "users", cred.user.uid), {
			firstName,
			lastName,
			email,
			role: roleKey,
			roleLabel,
			createdAt: new Date(),
		});

		await fbSignOut(secAuth);

		return {
			uid: cred.user.uid,
			email: cred.user.email,
			displayName: cred.user.displayName,
			photoURL: cred.user.photoURL,
		};
	},
};
