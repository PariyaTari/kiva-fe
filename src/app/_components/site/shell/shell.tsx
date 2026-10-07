"use client";

import { Suspense, useEffect } from "react";
import { usePathname } from "next/navigation";
import classNames from "classnames";
import { useQuery } from "@tanstack/react-query";
import CartDrawer from "@/app/_components/site/cartDrawer/cartDrawer";
import Footer from "@/app/_components/site/footer/footer";
import Header from "@/app/_components/site/header/header";
import LoginPrompt from "@/app/_components/site/loginPrompt/loginPrompt";
import MobileMenu from "@/app/_components/site/mobileMenu/mobileMenu";
import SearchPanel from "@/app/_components/site/searchPanel/searchPanel";
import { SiteEndpoints } from "@/app/_components/site/_api/siteEndpoints";
import { SITE_CONFIG } from "@/config/site";
import { useUiStore } from "@/store/ui.store";
import { withMappedError } from "@/utils/withMappedError";

/**
 * Storefront chrome around every page (design: `#kv-header` + drawers + search + `#kv-footer`).
 * Pages render their own `<main>`; the header is `fixed`, so a page's first section offsets itself
 * with `var(--top)` exactly like the HTML design.
 */
export default function SiteShell({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const panel = useUiStore((s) => s.panel);
	const open = useUiStore((s) => s.open);
	const closeAll = useUiStore((s) => s.closeAll);

	// header/footer content (`/kiva-configs/config` of this app); until it answers, the same values straight from `SITE_CONFIG`
	const config = useQuery({
		queryKey: ["site", "config"],
		queryFn: () => withMappedError(() => SiteEndpoints.getConfig()),
	});
	const siteConfig = config.data ?? SITE_CONFIG;

	// navigating closes whatever overlay is open
	useEffect(() => {
		closeAll();
	}, [pathname, closeAll]);

	// drawers lock the page scroll (the search sheet doesn't — same as the design)
	useEffect(() => {
		document.body.style.overflow = panel === "menu" || panel === "cart" ? "hidden" : "";
		return () => {
			document.body.style.overflow = "";
		};
	}, [panel]);

	// Esc closes, "/" opens the search
	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") closeAll();
			const typing = /INPUT|TEXTAREA|SELECT/.test((document.activeElement as HTMLElement | null)?.tagName ?? "");
			if (e.key === "/" && !typing) {
				e.preventDefault();
				open("search");
			}
		};
		document.addEventListener("keydown", onKey);
		return () => document.removeEventListener("keydown", onKey);
	}, [open, closeAll]);

	return (
		<>
			<Header config={siteConfig} />
			<div className={classNames("kv-overlay", { on: panel !== null })} id="kvOverlay" onClick={closeAll} />
			<MobileMenu social={siteConfig.social ?? []} />
			<CartDrawer />
			<SearchPanel />
			{children}
			<Footer config={siteConfig} />
			<Suspense>
				<LoginPrompt />
			</Suspense>
		</>
	);
}
