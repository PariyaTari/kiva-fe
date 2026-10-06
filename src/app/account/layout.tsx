import "./_styles/account.css";
import type { Metadata } from "next";
import AccountShell from "./_components/accountShell/accountShell";

export const metadata: Metadata = {
	title: "حساب کاربری",
};

/** Account — design `account.html`; each side-menu panel is its own route under `/account/*`. */
export default function AccountLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="pg-account">
			<AccountShell>{children}</AccountShell>
		</div>
	);
}
