import { create } from "zustand";

type Panel = "menu" | "cart" | "search" | null;

type UiState = {
	/** Which shell overlay is open — they are mutually exclusive, like the design's `openDrawer/closeAll`. */
	panel: Panel;
	/** Message of the «اول وارد شو» modal (design `K.needLogin`); `null` = closed. */
	loginPrompt: string | null;
	open: (panel: Exclude<Panel, null>) => void;
	closeAll: () => void;
	promptLogin: (message: string) => void;
	closeLoginPrompt: () => void;
};

export const useUiStore = create<UiState>((set) => ({
	panel: null,
	loginPrompt: null,
	open: (panel) => set({ panel }),
	closeAll: () => set({ panel: null }),
	promptLogin: (loginPrompt) => set({ loginPrompt, panel: null }),
	closeLoginPrompt: () => set({ loginPrompt: null }),
}));
