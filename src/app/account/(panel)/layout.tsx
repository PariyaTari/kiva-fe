import type { Metadata } from "next";
import AccountShell from "../_components/accountShell/accountShell";

// here, not in the account layout — a title there would keep the root «%s | کیوا» template from the return page
export const metadata: Metadata = {
	title: "حساب کاربری",
};

/** The side-menu panels (`account.html`): greeting, stats, menu — each panel is its own route under `/account/*`. */
export default function AccountPanelLayout({ children }: { children: React.ReactNode }) {
	return <AccountShell>{children}</AccountShell>;
}
