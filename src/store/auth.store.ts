import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { AuthTokens, User } from "@/types/user.type";

type AuthState = {
	accessToken: string | null;
	refreshToken: string | null;
	user: User | null;
	/** `false` until the persisted session was read on the client — gate auth-dependent UI/queries on it. */
	hydrated: boolean;
	setSession: (tokens: AuthTokens, user: User) => void;
	setTokens: (tokens: AuthTokens) => void;
	setUser: (user: User) => void;
	clear: () => void;
};

/**
 * OTP + JWT session (kiva-openapi.yml · Auth). Persisted in localStorage; hydration is skipped on
 * creation and triggered by `SessionProvider` after mount so the server render and first client
 * render agree (both start as a guest).
 */
export const useAuthStore = create<AuthState>()(
	persist(
		(set) => ({
			accessToken: null,
			refreshToken: null,
			user: null,
			hydrated: false,
			setSession: (tokens, user) => set({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken, user }),
			setTokens: (tokens) => set({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken }),
			setUser: (user) => set({ user }),
			clear: () => set({ accessToken: null, refreshToken: null, user: null }),
		}),
		{
			name: "kiva-auth",
			storage: createJSONStorage(() => localStorage),
			partialize: ({ accessToken, refreshToken, user }) => ({ accessToken, refreshToken, user }),
			skipHydration: true,
			onRehydrateStorage: () => () => useAuthStore.setState({ hydrated: true }),
		},
	),
);

/** Display name the design greets with («سلام سارا» / «دوست عزیز»). */
export function displayNameOf(user: User | null): string {
	return user?.firstName || user?.displayName || "دوست عزیز";
}
