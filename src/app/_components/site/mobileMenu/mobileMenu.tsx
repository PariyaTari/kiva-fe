"use client";

import Link from "next/link";
import classNames from "classnames";
import { useQuery } from "@tanstack/react-query";
import Logo from "@/app/_components/common/logo/logo";
import { Icon } from "@/app/_components/icon/icons";
import { MessengerIcon } from "@/app/_components/icon/messengerIcon";
import { CategoryIcon } from "@/app/_components/site/megaMenu/megaMenu";
import { MAIN_NAV, MOBILE_EXTRA_NAV } from "@/app/_components/site/nav";
import { SiteEndpoints } from "@/app/_components/site/_api/siteEndpoints";
import { useUiStore } from "@/store/ui.store";
import { SocialLink } from "@/types/siteConfig.type";
import { withMappedError } from "@/utils/withMappedError";

/** `#kvMenu` — the right drawer below 900px: search, category circles, every link, messengers. */
export default function MobileMenu({ social }: { social: SocialLink[] }) {
	const panel = useUiStore((s) => s.panel);
	const open = useUiStore((s) => s.open);
	const closeAll = useUiStore((s) => s.closeAll);

	const categories = useQuery({
		queryKey: ["site", "categories"],
		queryFn: () => withMappedError(() => SiteEndpoints.listCategories()),
	});

	return (
		<aside className={classNames("drawer right", { on: panel === "menu" })} id="kvMenu" aria-label="منو" aria-hidden={panel !== "menu"}>
			<div className="drawer-head">
				<Logo style={{ height: 26 }} />
				<button type="button" className="icon-btn" aria-label="بستن" onClick={closeAll}>
					<Icon name="close" />
				</button>
			</div>
			<div className="drawer-body">
				<button
					type="button"
					className="input"
					onClick={() => open("search")}
					style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--ink-50)", cursor: "pointer", textAlign: "right" }}
				>
					<Icon name="search" /> جستجوی کیف، رنگ، دسته‌بندی…
				</button>
				<div className="m-cats">
					{categories.data?.map((c) => (
						<Link key={c.slug} href={`/products?category=${c.slug}`} onClick={closeAll}>
							<span className="ic">
								<CategoryIcon category={c} />
							</span>
							{c.name}
						</Link>
					))}
				</div>
				<nav className="m-nav">
					{[...MAIN_NAV, ...MOBILE_EXTRA_NAV].map((item) => (
						<Link key={item.href} href={item.href} onClick={closeAll}>
							{item.label}
							<Icon name="left" />
						</Link>
					))}
				</nav>
			</div>
			<div className="drawer-foot">
				<div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
					{social.map((s) => (
						<a key={s.channel} className="icon-btn" href={s.url} target="_blank" rel="noopener" aria-label={s.name} style={{ width: 46, height: 46 }}>
							<MessengerIcon channel={s.channel} />
						</a>
					))}
				</div>
			</div>
		</aside>
	);
}
