import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/firebase/admin";

async function ensureIsAdmin(req: NextRequest) {
	const hdr = req.headers.get("authorization");
	if (!hdr?.startsWith("Bearer "))
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	const token = hdr.slice("Bearer ".length);
	const decoded = await adminAuth().verifyIdToken(token);

	if (!decoded.admin && decoded.role === "client") {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	}
	return null;
}

type Params = { uid: string };

export async function PATCH(
	req: NextRequest,
	{ params }: { params: Promise<Params> }
) {
	const guard = await ensureIsAdmin(req);
	if (guard) return guard;

	const { uid } = await params;
	const body = await req.json().catch(() => ({}));
	const password = (body?.password as string | undefined)?.trim();

	if (!password || password.length < 6) {
		return NextResponse.json(
			{ error: "Password inválido (min 6)" },
			{ status: 400 }
		);
	}

	await adminAuth().updateUser(uid, { password });
	return new NextResponse(null, { status: 204 });
}

export async function DELETE(
	req: NextRequest,
	{ params }: { params: Promise<Params> }
) {
	const guard = await ensureIsAdmin(req);
	if (guard) return guard;

	const { uid } = await params;

	await adminDb()
		.doc(`users/${uid}`)
		.delete()
		.catch(() => {});
	await adminAuth().deleteUser(uid);

	return new NextResponse(null, { status: 204 });
}
