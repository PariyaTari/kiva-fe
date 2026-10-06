"use client";

import { MouseEvent, useEffect, useState } from "react";
import Link from "next/link";
import classNames from "classnames";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import ErrorComponent from "@/app/_components/common/errorComponent2/errorComponent2";
import Loading from "@/app/_components/common/loading/loading";
import Reveal from "@/app/_components/common/reveal/reveal";
import { Icon } from "@/app/_components/icon/icons";
import MediaImage from "@/app/_components/shop/mediaImage/mediaImage";
import { toErrorView } from "@/utils/apiError";
import { toPersianDigits } from "@/utils/digits";
import { formatDate } from "@/utils/format";
import { withMappedError } from "@/utils/withMappedError";
import { BlogEndpoints } from "../../_api/blogEndpoints";
import { ERROR_BEHAVIOUR } from "../../_utils/apiError";
import PostCard, { postHref } from "../postCard/postCard";

const DEBOUNCE_MS = 150;
const PAGE_SIZE = 9;

/** `blog.html` — hero with category chips + search, the editor's pick, the post grid and paging. */
export default function BlogView() {
	const [category, setCategory] = useState<string | null>(null);
	// what the box shows vs. what we query (debounced)
	const [term, setTerm] = useState("");
	const [query, setQuery] = useState("");
	const [page, setPage] = useState(1);

	useEffect(() => {
		const t = setTimeout(() => {
			setQuery(term.trim());
			setPage(1);
		}, DEBOUNCE_MS);
		return () => clearTimeout(t);
	}, [term]);

	const categories = useQuery({
		queryKey: ["blog", "categories"],
		queryFn: () => withMappedError(() => BlogEndpoints.getCategories()),
		meta: { showNotification: true },
	});

	const posts = useQuery({
		queryKey: ["blog", "posts", { category, q: query, page }],
		queryFn: ({ signal }) => withMappedError(() => BlogEndpoints.getPosts({ category: category ?? undefined, q: query, page, size: PAGE_SIZE }, signal)),
		placeholderData: keepPreviousData,
		meta: { showNotificationOnRefetch: true },
	});

	const pickCategory = (slug: string | null) => {
		setCategory(slug);
		setPage(1);
	};

	const goTo = (e: MouseEvent, n: number) => {
		e.preventDefault();
		setPage(n);
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	const data = posts.data;
	const featured = data?.featured;
	const totalPages = data?.meta?.totalPages ?? 1;
	const postsError = toErrorView(ERROR_BEHAVIOUR, posts.error, "دریافت مقاله‌ها با خطا مواجه شد.");

	return (
		<>
			<section className="page-hero">
				<div className="container">
					<nav className="crumbs" aria-label="مسیر">
						<Link href="/">خانه</Link>
						<Icon name="left" />
						<span>بلاگ</span>
					</nav>
					<h1>مجله کیوا</h1>
					<p>راهنمای خرید، نگهداری از کیف، استایل و پشت صحنه‌ی کیوا.</p>
					<div className="b-tools">
						<div className="b-cats" id="bCats">
							<button type="button" className={classNames("chip", { on: !category })} onClick={() => pickCategory(null)}>
								همه
							</button>
							{categories.data?.map((c) => (
								<button key={c.slug} type="button" className={classNames("chip", { on: category === c.slug })} onClick={() => pickCategory(c.slug)}>
									{c.name}
								</button>
							))}
						</div>
						<div className="b-search">
							<Icon name="search" />
							<input className="input" id="bq" type="search" placeholder="جستجو در مقاله‌ها…" aria-label="جستجو در مقاله‌ها" value={term} onChange={(e) => setTerm(e.target.value)} />
						</div>
					</div>
				</div>
			</section>
			<div className="container">
				{posts.isLoading ? (
					<Loading />
				) : !!postsError ? (
					<div style={{ paddingTop: 40 }}>
						<ErrorComponent
							retryable={postsError.retryable}
							ticketAble={postsError.ticketAble}
							errorText={postsError.errorText}
							executeFunction={() => posts.refetch()}
							loading={posts.isFetching}
						/>
					</div>
				) : !posts.error && !!data ? (
					<div style={posts.isPlaceholderData ? { opacity: 0.6, transition: "opacity .2s" } : undefined}>
						{featured && (
							<Reveal as={Link} className="feat-post" id="feat" href={postHref(featured)}>
								<div className="cv" style={featured.coverBackground ? { background: featured.coverBackground } : undefined}>
									<MediaImage src={featured.cover?.url} alt={featured.cover?.alt ?? featured.title} cover eager />
								</div>
								<div className="tx">
									<span className="tag">منتخب سردبیر</span>
									<h2>{featured.title}</h2>
									<p>{featured.excerpt}</p>
									<div className="meta">
										<span>{formatDate(featured.publishedAt)}</span>
										<span>{toPersianDigits(featured.readingMinutes)} دقیقه مطالعه</span>
									</div>
									<span className="go">
										ادامه مطلب <Icon name="arrow" />
									</span>
								</div>
							</Reveal>
						)}
						<div className="posts" id="posts">
							{data.items.length ? (
								data.items.map((post, i) => <PostCard key={post.id} post={post} delay={(i % 3) * 0.07} />)
							) : (
								<div className="no-post">{data.emptyMessage ?? "مقاله‌ای با این مشخصات پیدا نشد."}</div>
							)}
						</div>
						{totalPages > 1 && (
							<nav className="pager" aria-label="صفحه‌بندی">
								{page > 1 && (
									<a href={`?page=${page - 1}`} aria-label="قبلی" onClick={(e) => goTo(e, page - 1)}>
										<Icon name="right" />
									</a>
								)}
								{Array.from({ length: totalPages }, (_, i) => i + 1).map((n) =>
									n === page ? (
										<span key={n} className="on">
											{toPersianDigits(n)}
										</span>
									) : (
										<a key={n} href={`?page=${n}`} onClick={(e) => goTo(e, n)}>
											{toPersianDigits(n)}
										</a>
									),
								)}
								{page < totalPages && (
									<a href={`?page=${page + 1}`} aria-label="بعدی" onClick={(e) => goTo(e, page + 1)}>
										<Icon name="left" />
									</a>
								)}
							</nav>
						)}
					</div>
				) : null}
			</div>
		</>
	);
}
