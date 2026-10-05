import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type CartState = {
	/** Guest cart token (`X-Cart-Token`) — issued by the server on the first cart request, merged into the user's cart on login. */
	guestToken: string | null;
	setGuestToken: (token: string | null) => void;
};

export const useCartStore = create<CartState>()(
	persist(
		(set) => ({
			guestToken: null,
			setGuestToken: (guestToken) => set({ guestToken }),
		}),
		{ name: "kiva-cart", storage: createJSONStorage(() => localStorage), skipHydration: true },
	),
);
