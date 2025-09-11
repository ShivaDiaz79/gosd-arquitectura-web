import { auth, db } from "@/firebase/config";
import {
	onAuthStateChanged,
	signInWithEmailAndPassword,
	signOut,
	User as FirebaseUser,
	createUserWithEmailAndPassword,
	updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

export interface UserSimple {
	uid: string;
	email: string | null;
	displayName: string | null;
	photoURL: string | null;
}

export interface Profile {
	role: string;
	[key: string]: any;
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
		await signOut(auth);
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
		lastName: string
	): Promise<FirebaseUser> {
		const cred = await createUserWithEmailAndPassword(auth, email, password);

		await updateProfile(cred.user, {
			displayName: `${firstName} ${lastName}`,
		});

		await setDoc(doc(db, "users", cred.user.uid), {
			firstName,
			lastName,
			email,
			role: "user",
			createdAt: new Date(),
		});

		return cred.user;
	},
};
