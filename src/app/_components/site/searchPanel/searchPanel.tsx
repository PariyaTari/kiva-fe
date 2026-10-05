"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import classNames from "classnames";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import ErrorComponent from "@/app/_components/common/errorComponent2/errorComponent2";
import { Icon } from "@/app/_components/icon/icons";
import MediaImage from "@/app/_components/shop/mediaImage/mediaImage";
import { SiteEndpoints } from "@/app/_components/site/_api/siteEndpoints";
import { useUiStore } from "@/store/ui.store";
import { toErrorView } from "@/utils/apiError";
import { formatPrice } from "@/utils/format";
import { withMappedError } from "@/utils/withMappedError";
import { ERROR_BEHAVIOUR } from "../_utils/apiError";

const DEBOUNCE_MS = 160;

/** `.kv-search` — the top sheet with live results (`/search/suggest`) and category/colour hints. */
export default function SearchPanel() {
	const router = useRouter();
	const panel = useUiStore((s) => s.panel);
	const closeAll = useUiStore((s) => s.closeAll);
	const isOpen = panel === "search";
	const inputRef = useRef<HTMLInputElement>(null);

	// what the user sees vs. what we query (debounced)
	const [term, setTerm] = useState("");
	const [query, setQuery] = useState("");

	useEffect(() => {
		const t = setTimeout(() => setQuery(term.trim()), DEBOUNCE_MS);
		return () => clearTimeout(t);
	}, [term]);

	useEffect(() => {
		if (!isOpen) return;
		const t = setTimeout(() => inputRef.current?.focus(), 300);
		return () => clearTimeout(t);
	}, [isOpen]);

	const hints = useQuery({
		queryKey: ["search", "hints"],
		queryFn: () => withMappedError(() => SiteEndpoints.getSearchHints()),
		enabled: isOpen,
	});

	const suggest = useQuery({
		queryKey: ["search", "suggest", query],
		queryFn: ({ signal }) => withMappedError(() => SiteEndpoints.searchSuggest(query, signal)),
		enabled: isOpen && !!query,
		placeholderData: keepPreviousData,
		meta: { showNotificationOnRefetch: true },
	});

	const goToResults = () => {
		const q = term.trim();
		if (!q) return;
		closeAll();
		router.push(`/products?q=${encodeURIComponent(q)}`);
	};

	const hintsError = toErrorView(ERROR_BEHAVIOUR, hints.error, "دریافت پیشنهادهای جستجو با خطا مواجه شد.");
	const suggestError = toErrorView(ERROR_BEHAVIOUR, suggest.error, "جستجو با خطا مواجه شد.");
	const results = term.trim() ? suggest.data : undefined;

	return (
		<div className={classNames("kv-search", { on: isOpen })} id="kvSearch" role="dialog" aria-label="جستجو" aria-hidden={!isOpen}>
			<div className="container">
				<div className="kv-search-bar">
					<Icon name="search" />
					<input
						ref={inputRef}
						id="kvSearchInput"
						type="search"
						placeholder="اسم کیف، رنگ یا دسته‌بندی رو بنویس…"
						autoComplete="off"
						value={term}
						onChange={(e) => setTerm(e.target.value)}
						onKeyDown={(e) => e.key === "Enter" && goToResults()}
					/>
					<button type="button" className="icon-btn" aria-label="بستن" onClick={closeAll}>
						<Icon name="close" />
					</button>
				</div>

				{hintsError ? (
					<div style={{ marginTop: 18 }}>
						<ErrorComponent
							retryable={hintsError.retryable}
							ticketAble={hintsError.ticketAble}
							errorText={hintsError.errorText}
							executeFunction={() => hints.refetch()}
							height={56}
							loading={hints.isFetching}
						/>
					</div>
				) : (
					hints.data && (
						<>
							<div className="kv-search-hint">
								<b>دسته‌بندی‌ها:</b>
								{hints.data.categories.map((c) => (
									<Link key={c.slug} className="chip" href={`/products?category=${c.slug}`} onClick={closeAll}>
										{c.name}
									</Link>
								))}
							</div>
							<div className="kv-search-hint">
								<b>رنگ‌ها:</b>
								{hints.data.colors.map((c) => (
									<Link key={c.key} className="chip" href={`/products?color=${c.key}`} onClick={closeAll}>
										<span className="swatch-dot" style={{ background: c.hex }} />
										{c.name}
									</Link>
								))}
							</div>
						</>
					)
				)}

				<div className="kv-search-res">
					{suggestError ? (
						<div style={{ gridColumn: "1/-1" }}>
							<ErrorComponent
								retryable={suggestError.retryable}
								ticketAble={suggestError.ticketAble}
								errorText={suggestError.errorText}
								executeFunction={() => suggest.refetch()}
								height={56}
								loading={suggest.isFetching}
							/>
						</div>
					) : results && results.products.length ? (
						<>
							{results.products.map((p, i) => (
								<Link key={p.id} className="sres" style={{ animationDelay: `${i * 40}ms` }} href={p.url} onClick={closeAll}>
									<span className="th">
										<MediaImage src={p.imageUrl} alt={p.name} />
									</span>
									<span>
										<h5 dangerouslySetInnerHTML={{ __html: p.nameHighlighted }} />
										<p>
											{p.categoryName} · {formatPrice(p.price.price)} تومان
										</p>
									</span>
								</Link>
							))}
							<Link
								className="sres"
								href={`/products?q=${encodeURIComponent(results.normalizedQuery)}`}
								style={{ justifyContent: "center", color: "var(--purple)", fontWeight: 700 }}
								onClick={closeAll}
							>
								همه نتایج برای «{results.normalizedQuery}» <Icon name="arrow" />
							</Link>
						</>
					) : results ? (
						<div className="empty" style={{ gridColumn: "1/-1", padding: 20 }}>
							برای «{results.normalizedQuery}» چیزی پیدا نکردیم. یه کلمه دیگه امتحان کن.
						</div>
					) : null}
				</div>
			</div>
		</div>
	);
}
