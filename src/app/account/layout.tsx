import "./_styles/account.css";
import "./_styles/orderActions.css";
import type { Metadata } from "next";
import { NO_INDEX } from "@/utils/seo";

// personal pages — every `/account/*` route inherits it
export const metadata: Metadata = {
	robots: NO_INDEX,
};

/**
 * Account — design `account.html` (panels in `(panel)/`, inside the side-menu shell) and the order-action
 * pages of `kiva-order-actions` (the return page has the checkout-like layout, without the menu).
 */
export default function AccountLayout({ children }: { children: React.ReactNode }) {
	return <div className="pg-account">{children}</div>;
}
