"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import classNames from "classnames";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import ErrorComponent from "@/app/_components/common/errorComponent2/errorComponent2";
import { Icon } from "@/app/_components/icon/icons";
import BagArt from "@/app/_components/shop/bagArt/bagArt";
import ProductCard from "@/app/_components/shop/productCard/productCard";
import ProductCardSkeleton from "@/app/_components/shop/productCard/productCardSkeleton";
import { CategoryIcon } from "@/app/_components/site/megaMenu/megaMenu";
import { SiteEndpoints } from "@/app/_components/site/_api/siteEndpoints";
import { useHydrated } from "@/hooks/useHydrated";
import { toast } from "@/store/notification.store";
import { toErrorView } from "@/utils/apiError";
import { toPersianDigits } from "@/utils/digits";
import { withMappedError } from "@/utils/withMappedError";
import { ProductsEndpoints } from "../../_api/productsEndpoints";
import { AppliedFilter, ProductFilters, ProductSort } from "../../_types/products.type";
import { ERROR_BEHAVIOUR } from "../../_utils/apiError";
import { EMPTY_FILTERS, parseFilters, SORT_OPTIONS, toSearch } from "../../_utils/filters";
import FiltersPanel from "../filtersPanel/filtersPanel";

const PAGE_SIZE = 24;
const SUBTITLE = "همه‌ی کیف‌ها با عکس و ویدیوی واقعی؛ رنگت رو انتخاب کن تا عکس همون رنگ رو ببینی.";

/** Shop — filters & sort live in the URL (`/products?category=…&color=…&sort=…`). */
export default function ProductsView() {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const { filters, sort } = useMemo(() => parseFilters(new URLSearchParams(searchParams.toString())), [searchParams]);
	const [sheetOpen, setSheetOpen] = useState(false);
	const shop = useRef<HTMLDivElement>(null);
	const hydrated = useHydrated();

	const products = useQuery({
		queryKey: ["products", "list", { ...filters, sort }],
		queryFn: () => withMappedError(() => ProductsEndpoints.listProducts({ ...filters, sort, page: 1, size: PAGE_SIZE, includeFacets: true })),
		placeholderData: keepPreviousData,
		meta: { showNotificationOnRefetch: true },
	});

	// shared with the header's mega menu
	const categories = useQuery({
		queryKey: ["site", "categories"],
		queryFn: () => withMappedError(() => SiteEndpoints.listCategories()),
	});

	const title = products.data?.title ?? "فروشگاه کیوا";

	// the tab title follows the listing («کیف دوشی | کیوا»)
	useEffect(() => {
		document.title = `${title} | کیوا`;
	}, [title]);

	// the bottom sheet locks the page scroll while open
	useEffect(() => {
		document.body.style.overflow = sheetOpen ? "hidden" : "";
		return () => {
			document.body.style.overflow = "";
		};
	}, [sheetOpen]);

	const navigate = (next: ProductFilters, nextSort: ProductSort = sort) => router.replace(`${pathname}${toSearch(next, nextSort)}`, { scroll: false });

	const apply = (next: ProductFilters) => {
		navigate(next);
		setSheetOpen(false);
		if (window.innerWidth < 900 && shop.current) window.scrollTo({ top: shop.current.offsetTop - 70, behavior: "smooth" });
	};

	const reset = () => {
		navigate(EMPTY_FILTERS);
		setSheetOpen(false);
		toast("همه فیلترها حذف شد", { icon: "refresh" });
	};

	const removeChip = (chip: AppliedFilter) => {
		const next = { ...filters };
		if (chip.key === "q") next.q = "";
		if (chip.key === "category") next.category = filters.category.filter((c) => c !== chip.value);
		if (chip.key === "color") next.color = filters.color.filter((c) => c !== chip.value);
		if (chip.key === "price") Object.assign(next, { minPrice: null, maxPrice: null });
		if (chip.key === "onSale") next.onSale = false;
		if (chip.key === "inStock") next.inStock = false;
		navigate(next);
	};

	const chips = products.data?.appliedFilters ?? [];
	const items = products.data?.items ?? [];
	const one = filters.category.length === 1 ? filters.category[0] : null;
	const crumb = products.data?.breadcrumbs.at(-1)?.label ?? "فروشگاه";

	const productsError = toErrorView(ERROR_BEHAVIOUR, products.error, "دریافت لیست محصولات با خطا مواجه شد.");

	return (
		<>
			<section className="page-hero">
				<div className="container">
					<div className="hero-row">
						<div>
							<nav className="crumbs" aria-label="مسیر">
								<Link href="/">خانه</Link>
								<Icon name="left" />
								<span id="crumbLast">{crumb}</span>
							</nav>
							<h1 id="pageTitle">{title}</h1>
							<p id="pageSub">{products.data?.subtitle ?? SUBTITLE}</p>
						</div>
						<div className="art float">
							<BagArt type="tote" color="lilac" variant={2} />
						</div>
					</div>
					<div className="qcats" id="qcats">
						<button type="button" className={classNames("qcat all", { on: !filters.category.length })} onClick={() => navigate({ ...filters, category: [] })}>
							همه کیف‌ها
						</button>
						{/* the header may have filled this query before this boundary hydrates */}
						{hydrated &&
							categories.data?.map((c) => (
								<button key={c.slug} type="button" className={classNames("qcat", { on: one === c.slug })} onClick={() => navigate({ ...filters, category: [c.slug] })}>
									<span className="ic">
										<CategoryIcon category={c} />
									</span>
									{c.name}
								</button>
							))}
					</div>
				</div>
			</section>

			<div className="container shop" ref={shop}>
				<FiltersPanel
					applied={filters}
					facets={products.data?.facets}
					open={sheetOpen}
					onClose={() => setSheetOpen(false)}
					onApply={apply}
					onReset={reset}
				/>

				<section aria-label="محصولات">
					<div className="toolbar">
						<div style={{ display: "flex", alignItems: "center", gap: 10 }}>
							<button type="button" className="btn btn-outline btn-sm f-open" id="fOpen" onClick={() => setSheetOpen(true)}>
								<Icon name="filter" /> فیلترها{" "}
								<span className="tag" id="fCount" style={{ height: 20, padding: "0 7px", display: chips.length ? undefined : "none" }}>
									{chips.length ? toPersianDigits(chips.length) : ""}
								</span>
							</button>
							<span className="cnt" id="resCount">
								{products.data && (
									<>
										<b>{toPersianDigits(products.data.meta.totalItems)}</b> محصول
									</>
								)}
							</span>
						</div>
						<div className="sort" role="group" aria-label="مرتب‌سازی">
							<span>
								<Icon name="sort" />
								مرتب‌سازی:
							</span>
							{SORT_OPTIONS.map((o) => (
								<button key={o.value} type="button" className={classNames({ on: sort === o.value })} onClick={() => navigate(filters, o.value)}>
									{o.label}
								</button>
							))}
						</div>
						<select className="select sort-m" id="sortM" aria-label="مرتب‌سازی" value={sort} onChange={(e) => navigate(filters, e.target.value as ProductSort)}>
							{SORT_OPTIONS.map((o) => (
								<option key={o.value} value={o.value}>
									{o.label}
								</option>
							))}
						</select>
					</div>

					<div className="active-f" id="activeF">
						{chips.map((chip) => (
							<button key={`${chip.key}|${chip.value ?? ""}`} type="button" className="chip" onClick={() => removeChip(chip)}>
								{chip.swatchHex && <span className="swatch-dot" style={{ background: chip.swatchHex }} />}
								{chip.label} <Icon name="close" />
							</button>
						))}
						{chips.length > 1 && (
							<button type="button" className="clear" id="clearAll" onClick={reset}>
								حذف همه
							</button>
						)}
					</div>

					{products.isLoading ? (
						<div className="p-grid" id="grid">
							{Array.from({ length: 6 }, (_, i) => (
								<ProductCardSkeleton key={i} />
							))}
						</div>
					) : productsError ? (
						<ErrorComponent
							retryable={productsError.retryable}
							ticketAble={productsError.ticketAble}
							errorText={productsError.errorText}
							executeFunction={() => products.refetch()}
							loading={products.isFetching}
						/>
					) : !products.error && products.data && !items.length ? (
						<div className="p-grid" id="grid" style={{ display: "block" }}>
							<div className="no-res">
								<div className="art">
									<BagArt type="bucket" color="lilac" variant={2} />
								</div>
								<h3>چیزی با این فیلترها پیدا نکردیم</h3>
								<p>چند تا از فیلترها رو بردار یا محدوده قیمت رو بازتر کن.</p>
								<button type="button" className="btn btn-primary" onClick={reset}>
									حذف فیلترها
								</button>
							</div>
						</div>
					) : !products.error && products.data ? (
						<div className={classNames("p-grid", { "grid-loading": products.isPlaceholderData })} id="grid">
							{items.map((p, i) => (
								<ProductCard key={`${p.id}-${p.displayColorKey}`} product={p} delay={(i % 3) * 0.06} />
							))}
						</div>
					) : null}
				</section>
			</div>

			<div className={classNames("kv-overlay", { on: sheetOpen })} onClick={() => setSheetOpen(false)} />
		</>
	);
}
