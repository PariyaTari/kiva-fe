"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";
import { useCartStore } from "@/store/cart.store";

/**
 * Reads the persisted session (tokens + guest cart token) once on the client. Both stores skip
 * hydration on creation so the server render and the first client render match; auth-dependent
 * queries wait for `hydrated`.
 */
export function SessionProvider() {
	useEffect(() => {
		useCartStore.persist.rehydrate();
		useAuthStore.persist.rehydrate();
	}, []);

	return null;
}
