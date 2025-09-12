"use client";

import { attachAuthListenerOnce } from "@/stores/useAuthStore";
import { useEffect } from "react";

export default function AuthInit() {
	useEffect(() => {
		const unsub = attachAuthListenerOnce();
		return () => unsub?.();
	}, []);
	return null;
}
