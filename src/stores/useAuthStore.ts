"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
	onAuthStateChanged,
	signInWithEmailAndPassword,
	signOut as fbSignOut,
	User as FirebaseUser,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/firebase/config";

interface UserSimple {
	uid: string;
	email: string | null;
	displayName: string | null;
	photoURL: string | null;
}

interface Profile {
	role: string;
	[key: string]: any;
}

interface AuthState {
	user: UserSimple | null;
	profile: Profile | null;
	status: "loading" | "authenticated" | "unauthenticated";
	hasHydrated: boolean;

	setHasHydrated: (b: boolean) => void;
	setFromFirebase: (user: FirebaseUser | null) => Promise<void>;
	refreshProfile: () => Promise<void>;
	signIn: (email: string, password: string) => Promise<void>;
	signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
	persist(
		(set, get) => ({
			user: null,
			profile: null,
			status: "loading",
			hasHydrated: false,

			setHasHydrated: (b: boolean) => set({ hasHydrated: b }),

			async setFromFirebase(user: FirebaseUser | null) {
				if (!user) {
					set({ user: null, profile: null, status: "unauthenticated" });
					return;
				}
				const simple: UserSimple = {
					uid: user.uid,
					email: user.email,
					displayName: user.displayName,
					photoURL: user.photoURL,
				};
				set({ user: simple, status: "authenticated" });
				await get()
					.refreshProfile()
					.catch(() => {});
			},

			async refreshProfile() {
				const u = get().user;
				if (!u) return;
				try {
					const snap = await getDoc(doc(db, "users", u.uid));
					if (snap.exists()) {
						const data = snap.data() || {};
						set({
							profile: {
								role: (data.rol as string) || data.role || "user",
								...data,
							},
						});
					} else {
						set({ profile: { role: "user" } });
					}
				} catch {
					/* noop */
				}
			},

			async signIn(email: string, password: string) {
				const cred = await signInWithEmailAndPassword(auth, email, password);
				await get().setFromFirebase(cred.user);
			},

			async signOut() {
				await fbSignOut(auth);
				set({ user: null, profile: null, status: "unauthenticated" });
			},
		}),
		{
			name: "auth-v1",
			storage: createJSONStorage(() => localStorage),
			partialize: (s) => ({
				user: s.user,
				profile: s.profile,
				status: s.status,
			}),
			onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
		}
	)
);

export function attachAuthListenerOnce() {
	if ((globalThis as any).__authListenerAttached__) return () => {};
	(globalThis as any).__authListenerAttached__ = true;

	const setFromFirebase = useAuthStore.getState().setFromFirebase;
	const unsub = onAuthStateChanged(auth, (fbUser) => {
		setFromFirebase(fbUser);
	});
	return unsub;
}
