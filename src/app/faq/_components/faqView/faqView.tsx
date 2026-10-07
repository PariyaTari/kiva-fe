"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import classNames from "classnames";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import ErrorComponent from "@/app/_components/common/errorComponent2/errorComponent2";
import Loading from "@/app/_components/common/loading/loading";
import { Icon } from "@/app/_components/icon/icons";
import { toErrorView } from "@/utils/apiError";
import { toPersianDigits } from "@/utils/digits";
import { withMappedError } from "@/utils/withMappedError";
import { FaqEndpoints } from "../../_api/faqEndpoints";
import { ERROR_BEHAVIOUR } from "../../_utils/apiError";
import StillBox from "../stillBox/stillBox";

const DEBOUNCE_MS = 180;
/** A group counts as «current» in the side list once its top passes this line (design scrollspy). */
const SPY_LINE = 160;

const subscribeHash = (onChange: () => void) => {
	window.addEventListener("hashchange", onChange);
	return () => window.removeEventListener("hashchange", onChange);
};
const readHash = () => decodeURIComponent(window.location.hash.slice(1));

/** `faq.html` — hero search, the sticky group list (scrollspy) and the accordions. `#group` opens its first question. */
export default function FaqView() {
	// what the box shows vs. what we query (debounced)
	const [term, setTerm] = useState("");
	const [query, setQuery] = useState("");
	/** Questions the shopper opened / closed by hand. */
	const [toggled, setToggled] = useState<Record<number, boolean>>({});
	const [spy, setSpy] = useState<string | null>(null);
	const hash = useSyncExternalStore(subscribeHash, readHash, () => "");

	useEffect(() => {
		const t = setTimeout(() => setQuery(term.trim()), DEBOUNCE_MS);
		return () => clearTimeout(t);
	}, [term]);

	// the whole list drives the side menu (its counts stay put while searching); prefetched on the server (`faq/page.tsx`)
	const all = useQuery({
		queryKey: ["faq", ""],
		queryFn: ({ signal }) => withMappedError(() => FaqEndpoints.getFaq("", signal)),
		meta: { showNotificationOnRefetch: true },
	});

	const found = useQuery({
		queryKey: ["faq", query],
		queryFn: ({ signal }) => withMappedError(() => FaqEndpoints.getFaq(query, signal)),
		enabled: !!query,
		// the previous answer (or, on the first search, the whole list) stays while the next one loads
		placeholderData: (previous) => keepPreviousData(previous) ?? all.data,
		meta: { showNotificationOnRefetch: true },
	});

	const shown = query ? found : all;
	const groups = shown.data?.groups ?? [];

	// a `#group` link scrolls to its group (the first question opens through `isOpen`)
	useEffect(() => {
		if (!hash || !all.data) return;
		const t = setTimeout(() => document.getElementById(hash)?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
		return () => clearTimeout(t);
	}, [hash, all.data]);

	// scrollspy for the side menu
	useEffect(() => {
		const onScroll = () => {
			let current: string | null = null;
			document.querySelectorAll<HTMLElement>(".f-group").forEach((s) => {
				if (s.getBoundingClientRect().top < SPY_LINE) current = s.id;
			});
			setSpy(current);
		};
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	const isOpen = (groupId: string, questionId: number, index: number) =>
		toggled[questionId] ?? (!!query || (index === 0 && groupId === hash));

	const activeGroup = spy ?? all.data?.groups[0]?.id;
	const listError = toErrorView(ERROR_BEHAVIOUR, shown.error, "دریافت سوالات با خطا مواجه شد.");

	return (
		<>
			<section className="page-hero">
				<div className="container">
					<nav className="crumbs" aria-label="مسیر">
						<Link href="/">خانه</Link>
						<Icon name="left" />
						<span>سوالات متداول</span>
					</nav>
					<h1>چطور می‌تونیم کمکت کنیم؟</h1>
					<p>جواب رایج‌ترین سوال‌ها درباره سفارش، ارسال، رزرو و عکس قبل از ارسال.</p>
					<div className="f-search">
						<Icon name="search" />
						<input
							className="input"
							id="fq"
							type="search"
							placeholder="مثلاً: رزرو، کد رهگیری، بازگشت…"
							aria-label="جستجو در سوالات"
							value={term}
							onChange={(e) => {
								setTerm(e.target.value);
								setToggled({});
							}}
						/>
					</div>
				</div>
			</section>
			<div className="container f-wrap">
				<nav className="f-cats" id="fCats" aria-label="دسته‌بندی سوالات">
					{all.data?.groups.map((g) => (
						<a key={g.id} href={`#${g.id}`} className={classNames({ on: g.id === activeGroup })} data-g={g.id}>
							<Icon name={g.icon ?? "info"} />
							{g.name}
							<span className="c">{toPersianDigits(g.questions.length)}</span>
						</a>
					))}
				</nav>
				<div>
					<div id="groups" style={found.isPlaceholderData ? { opacity: 0.6, transition: "opacity .2s" } : undefined}>
						{shown.isLoading ? (
							<Loading />
						) : !!listError ? (
							<ErrorComponent
								retryable={listError.retryable}
								ticketAble={listError.ticketAble}
								errorText={listError.errorText}
								executeFunction={() => shown.refetch()}
								loading={shown.isFetching}
							/>
						) : !shown.error && !!shown.data ? (
							groups.map((g) => (
								<section key={g.id} className={classNames("f-group", { sig: g.isSignature })} id={g.id}>
									<h2>
										<span className="gi">
											<Icon name={g.icon ?? "info"} />
										</span>
										{g.name}
										{g.isSignature && (
											<>
												{" "}
												<span className="tag">امضای کیوا</span>
											</>
										)}
									</h2>
									{g.questions.map((q, i) => {
										const open = isOpen(g.id, q.id, i);
										return (
											<div key={q.id} className={classNames("acc", { open })}>
												<button type="button" className="acc-q" aria-expanded={open} onClick={() => setToggled((t) => ({ ...t, [q.id]: !open }))}>
													{q.questionHighlighted ? <span dangerouslySetInnerHTML={{ __html: q.questionHighlighted }} /> : q.question}
													<span className="pm" />
												</button>
												<div className="acc-a">
													<div>
														<p dangerouslySetInnerHTML={{ __html: q.answerHighlighted ?? q.answer }} />
													</div>
												</div>
											</div>
										);
									})}
								</section>
							))
						) : null}
					</div>
					{!shown.error && !!shown.data && !groups.length && (
						<div className="none" id="none" style={{ display: "block" }}>
							{shown.data.emptyMessage ?? "سوالی با این کلمه پیدا نکردیم؛ از پشتیبانی بپرس"}
						</div>
					)}
					<StillBox />
				</div>
			</div>
		</>
	);
}
