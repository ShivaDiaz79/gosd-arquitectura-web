import { App, cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

let app: App;

if (!getApps().length) {
	const projectId = process.env.FIREBASE_PROJECT_ID!;
	const clientEmail = process.env.FIREBASE_CLIENT_EMAIL!;
	const privateKey = (process.env.FIREBASE_PRIVATE_KEY || "").replace(
		/\\n/g,
		"\n"
	);

	app = initializeApp({
		credential: cert({ projectId, clientEmail, privateKey }),
	});
} else {
	app = getApp();
}

export function getAdminApp(): App {
	return app;
}

export const adminAuth = () => getAuth(getAdminApp());
export const adminDb = () => getFirestore(getAdminApp());
