"use client";

import { ReactNode, useEffect, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore, attachAuthListenerOnce } from "@/stores/useAuthStore";

export default function AuthGuard({ children }: { children: ReactNode }) {
	const router = useRouter();
	const pathname = usePathname();

	const { status, hasHydrated, profile } = useAuthStore();

	useEffect(() => {
		const unsub = attachAuthListenerOnce();
		return () => unsub?.();
	}, []);

	const isAuthRoute = pathname === "/signin" || pathname === "/";

	const isReady = hasHydrated && status !== "loading";

	const redirectTo = useMemo(() => {
		if (!isReady) return null;

		if (status === "unauthenticated") {
			if (!isAuthRoute) {
				const next = encodeURIComponent(pathname);
				return `/signin?next=${next}`;
			}
			return null;
		}

		if (status === "authenticated" && !profile) {
			return null;
		}

		const isClient = profile?.role === "client";
		const targetBase = isClient ? "/usuario" : "/dashboard";

		if (isAuthRoute) return targetBase;
		if (isClient && pathname.startsWith("/dashboard")) return "/usuario";
		if (!isClient && pathname.startsWith("/usuario")) return "/dashboard";

		return null;
	}, [isReady, status, profile, isAuthRoute, pathname]);

	useEffect(() => {
		if (redirectTo) {
			router.replace(redirectTo);
		}
	}, [redirectTo, router]);

	const shouldShowLoader =
		!hasHydrated ||
		status === "loading" ||
		(status === "authenticated" && !profile) ||
		Boolean(redirectTo);

	if (shouldShowLoader) {
		return (
			<div className="grid min-h-[60vh] place-items-center">
				<div className="animate-spin size-8 rounded-full border-2 border-current border-t-transparent" />
			</div>
		);
	}

	if (status === "unauthenticated") return null;

	return <>{children}</>;
}
