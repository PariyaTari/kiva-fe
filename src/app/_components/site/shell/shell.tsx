"use client";

import { useEffect, useState } from "react";
import Header from "@/app/_components/site/header/header";
import MobileMenu from "@/app/_components/site/mobileMenu/mobileMenu";
import Footer from "@/app/_components/site/footer/footer";

/**
 * Storefront chrome: floating header (+ announcement bar), mobile drawer and footer.
 * The header is `fixed` and overlays the page — a page that starts at the very top offsets its
 * first section with `var(--site-top)` so its background can run underneath the header.
 */
export default function SiteShell({ children }: { children: React.ReactNode }) {
	const [mobileOpen, setMobileOpen] = useState(false);

	useEffect(() => {
		document.body.style.overflow = mobileOpen ? "hidden" : "";
		return () => {
			document.body.style.overflow = "";
		};
	}, [mobileOpen]);

	return (
		<div className="flex min-h-screen flex-col bg-background">
			<Header onOpenMobile={() => setMobileOpen(true)} />
			<MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />

			<main className="flex-1">{children}</main>

			<Footer />
		</div>
	);
}
