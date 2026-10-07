import "./_styles/login.css";
import { Suspense } from "react";
import type { Metadata } from "next";
import { NO_INDEX } from "@/utils/seo";

export const metadata: Metadata = {
	title: "ورود / ثبت‌نام",
	robots: NO_INDEX,
};

/** Kiva's own OTP login (design `login.html`) — rendered inside the site shell, like every page. */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="pg-login">
			{/* the login page reads `?next=` */}
			<Suspense>{children}</Suspense>
		</div>
	);
}
