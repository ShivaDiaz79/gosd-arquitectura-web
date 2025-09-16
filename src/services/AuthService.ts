import { auth, db } from "@/firebase/config";
import {
	onAuthStateChanged,
	signInWithEmailAndPassword,
	signOut as fbSignOut,
	User as FirebaseUser,
	createUserWithEmailAndPassword,
	updateProfile,
	getAuth,
	GoogleAuthProvider,
	FacebookAuthProvider,
	signInWithPopup,
} from "firebase/auth";
import {
	doc,
	getDoc,
	setDoc,
	getFirestore,
	serverTimestamp,
} from "firebase/firestore";
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

async function ensureUserDoc(
	u: FirebaseUser,
	fallbackRole: RoleKey = "client"
) {
	const ref = doc(db, "users", u.uid);
	const snap = await getDoc(ref);
	if (!snap.exists()) {
		const roleLabel =
			ROLES.find((r) => r.key === fallbackRole)?.label ?? fallbackRole;
		await setDoc(ref, {
			email: u.email ?? null,
			firstName: u.displayName?.split(" ")?.[0] ?? null,
			lastName: u.displayName?.split(" ")?.slice(1)?.join(" ") || null,
			role: fallbackRole,
			roleLabel,
			createdAt: serverTimestamp(),
			photoURL: u.photoURL ?? null,
			providerId: u.providerData?.[0]?.providerId ?? "password",
		});
	}
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
		await ensureUserDoc(cred.user);
		return cred.user;
	},

	async signOut(): Promise<void> {
		await fbSignOut(auth);
	},

	async getProfile(uid: string): Promise<Profile> {
		const snap = await getDoc(doc(db, "users", uid));
		if (snap.exists()) {
			const data = snap.data() || {};
			return { role: (data.role as string) || data.role || "user", ...data };
		}
		return { role: "user" };
	},

	async signUp(
		email: string,
		password: string,
		firstName: string,
		lastName: string,
		roleKey: RoleKey = "client"
	): Promise<UserSimple> {
		const { auth: secAuth, db: secDb } = getSecondary();
		const cred = await createUserWithEmailAndPassword(secAuth, email, password);

		await updateProfile(cred.user, { displayName: `${firstName} ${lastName}` });

		const roleLabel = ROLES.find((r) => r.key === roleKey)?.label ?? roleKey;

		await setDoc(doc(secDb, "users", cred.user.uid), {
			firstName,
			lastName,
			email,
			role: roleKey,
			roleLabel,
			createdAt: new Date(),
			photoURL: cred.user.photoURL ?? null,
			providerId: "password",
		});

		await fbSignOut(secAuth);

		return {
			uid: cred.user.uid,
			email: cred.user.email,
			displayName: cred.user.displayName,
			photoURL: cred.user.photoURL,
		};
	},

	async signUpSelf(
		email: string,
		password: string,
		firstName: string,
		lastName: string,
		roleKey: RoleKey = "client"
	): Promise<FirebaseUser> {
		const cred = await createUserWithEmailAndPassword(auth, email, password);
		await updateProfile(cred.user, { displayName: `${firstName} ${lastName}` });
		await ensureUserDoc(cred.user, roleKey);
		return cred.user;
	},

	async signInWithGoogle(roleKey: RoleKey = "client"): Promise<FirebaseUser> {
		const provider = new GoogleAuthProvider();
		provider.setCustomParameters({ prompt: "select_account" });
		const cred = await signInWithPopup(auth, provider);
		await ensureUserDoc(cred.user, roleKey);
		return cred.user;
	},

	async signInWithFacebook(roleKey: RoleKey = "client"): Promise<FirebaseUser> {
		const provider = new FacebookAuthProvider();
		provider.addScope("email");
		provider.setCustomParameters({ display: "popup" });
		const cred = await signInWithPopup(auth, provider);
		await ensureUserDoc(cred.user, roleKey);
		return cred.user;
	},
};
