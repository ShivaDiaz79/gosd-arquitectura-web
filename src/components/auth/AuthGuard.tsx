"use client";

import { ReactNode, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { attachAuthListenerOnce } from "@/stores/useAuthStore";

export default function AuthGuard({ children }: { children: ReactNode }) {
	const router = useRouter();
	const pathname = usePathname();

	const { status, hasHydrated, profile } = useAuthStore();

	useEffect(() => {
		const unsub = attachAuthListenerOnce();
		return () => unsub?.();
	}, []);

	useEffect(() => {
		if (!hasHydrated) return;

		if (status === "unauthenticated") {
			router.replace("/signin");
			return;
		}

		if (status === "authenticated" && profile) {
			console.log("profile role:", profile);
			const isClient = profile.role === "client";
			const target = isClient ? "/cliente" : "/dashboard";

			const onAuthRoutes = pathname === "/signin" || pathname === "/";
			const alreadyInArea = pathname.startsWith(target);

			if (onAuthRoutes && !alreadyInArea) {
				router.replace(target);
				return;
			}

			if (isClient && pathname.startsWith("/dashboard")) {
				router.replace("/cliente");
				return;
			}

			if (!isClient && pathname.startsWith("/cliente")) {
				router.replace("/dashboard");
				return;
			}
		}
	}, [status, hasHydrated, profile, pathname, router]);

	if (
		!hasHydrated ||
		status === "loading" ||
		(status === "authenticated" && !profile)
	) {
		return (
			<div className="grid min-h-[60vh] place-items-center">
				<div className="animate-spin size-8 rounded-full border-2 border-current border-t-transparent" />
			</div>
		);
	}

	if (status === "unauthenticated") return null;

	return <>{children}</>;
}
