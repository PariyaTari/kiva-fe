"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth.store";
import { useCartStore } from "@/store/cart.store";

/** Who is signed in — a token rotation keeps it, a login / logout / account switch changes it. */
const identityOf = () => {
	const { accessToken, user } = useAuthStore.getState();
	return accessToken ? `user:${user?.id ?? ""}` : "guest";
};

/**
 * Reads the persisted session (tokens + guest cart token) once on the client. Both stores skip
 * hydration on creation so the server render and the first client render match; auth-dependent
 * queries wait for `hydrated`.
 *
 * Tabs share localStorage but not memory: when another tab saves (rotated tokens, login, logout, a new
 * guest cart) this tab re-reads it. Otherwise its stale copy would be written back on its next change and
 * undo the other tab's rotation. A different person signed in (or out) also re-fetches everything shown.
 */
export function SessionProvider() {
	const queryClient = useQueryClient();

	useEffect(() => {
		useCartStore.persist.rehydrate();
		useAuthStore.persist.rehydrate();
	}, []);

	useEffect(() => {
		const authKey = useAuthStore.persist.getOptions().name;
		const cartKey = useCartStore.persist.getOptions().name;

		// a removed entry (`newValue === null`; `key === null` = the whole storage cleared) is an empty session —
		// rehydrating would keep this tab's copy, since there is nothing to merge in
		const onStorage = async (e: StorageEvent) => {
			if (e.storageArea !== localStorage) return;
			if (e.key === null || e.key === cartKey) {
				if (e.newValue === null) useCartStore.getState().setGuestToken(null);
				else await useCartStore.persist.rehydrate();
			}
			if (e.key === null || e.key === authKey) {
				const before = identityOf();
				if (e.newValue === null) useAuthStore.getState().clear();
				else await useAuthStore.persist.rehydrate();
				if (identityOf() !== before) queryClient.invalidateQueries();
			}
		};

		window.addEventListener("storage", onStorage);
		return () => window.removeEventListener("storage", onStorage);
	}, [queryClient]);

	return null;
}
