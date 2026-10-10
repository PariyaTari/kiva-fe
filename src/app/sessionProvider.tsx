"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AccountEndpoints } from "@/app/account/_api/accountEndpoints";
import { refreshSession } from "@/httpClient/session";
import { dropLegacySession, hasSessionHint, SESSION_HINT_KEY, useAuthStore } from "@/store/auth.store";
import { useCartStore } from "@/store/cart.store";

type Identity = { signedIn: boolean; userId: number | null };

/** Signed in, signed out or a different person — not a token rotation, a profile edit or the profile arriving. */
const identityChanged = (a: Identity, b: Identity) => a.signedIn !== b.signedIn || (a.userId !== null && b.userId !== null && a.userId !== b.userId);

let loading: Promise<void> | null = null;

/**
 * This browser's session cookie → an access token and the profile in this tab; parallel calls share one run.
 * Quiet on failure: a refused cookie already signed the browser out (guest), and after a network failure the
 * next 401 tries again.
 */
function loadSession() {
	loading ??= (async () => {
		try {
			await refreshSession();
			useAuthStore.getState().setUser(await AccountEndpoints.getMe());
		} catch {
			// see above
		}
	})().finally(() => {
		loading = null;
	});
	return loading;
}

/**
 * Restores the session once on the client (FRONTEND_AUTH §3): the access token lives in memory, so every
 * page load asks `POST /auth/refresh` for one — only when the session hint says a cookie exists, guests
 * don't pay a request. Auth-dependent queries wait for `hydrated`, so the server render and the first client
 * render match (both start as a guest).
 *
 * Tabs share the cookie and localStorage but not memory: a sign-in elsewhere (new hint) loads the session
 * here too, a sign-out (hint removed) drops this tab's still-valid access token. Whenever the person changes,
 * everything shown is fetched again.
 */
export function SessionProvider() {
	const queryClient = useQueryClient();
	const hydrated = useAuthStore((s) => s.hydrated);
	const signedIn = useAuthStore((s) => !!s.accessToken);
	const userId = useAuthStore((s) => s.user?.id ?? null);
	const shown = useRef<Identity | null>(null);

	useEffect(() => {
		useCartStore.persist.rehydrate();
		dropLegacySession();
		const { markHydrated } = useAuthStore.getState();
		if (hasSessionHint()) loadSession().finally(markHydrated);
		else markHydrated();
	}, []);

	// Tied to the render, not to the store change: the queries' new `enabled` reaches React Query in the same commit's
	// effects, so after a sign-out the signed-in-only ones are already off — instead of going out once more as a guest (401).
	useEffect(() => {
		if (!hydrated) return;
		const before = shown.current;
		shown.current = { signedIn, userId };
		// `before` empty: the session as restored on load — the queries waited for it
		if (before && identityChanged(before, shown.current)) setTimeout(() => queryClient.invalidateQueries());
	}, [hydrated, signedIn, userId, queryClient]);

	useEffect(() => {
		const cartKey = useCartStore.persist.getOptions().name;

		// a removed entry (`newValue === null`; `key === null` = the whole storage cleared) is an empty session —
		// rehydrating would keep this tab's copy, since there is nothing to merge in
		const onStorage = async (e: StorageEvent) => {
			if (e.storageArea !== localStorage) return;
			if (e.key === null || e.key === cartKey) {
				if (e.newValue === null) useCartStore.getState().setGuestToken(null);
				else await useCartStore.persist.rehydrate();
			}
			if (e.key === null || e.key === SESSION_HINT_KEY) {
				if (e.newValue === null) useAuthStore.getState().forget();
				else await loadSession();
			}
		};

		window.addEventListener("storage", onStorage);
		return () => window.removeEventListener("storage", onStorage);
	}, []);

	return null;
}
