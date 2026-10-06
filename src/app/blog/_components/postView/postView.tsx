"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import classNames from "classnames";
import { useMutation, useQuery } from "@tanstack/react-query";
import ErrorComponent from "@/app/_components/common/errorComponent2/errorComponent2";
import Loading from "@/app/_components/common/loading/loading";
import Reveal from "@/app/_components/common/reveal/reveal";
import { Icon } from "@/app/_components/icon/icons";
import { MessengerIcon } from "@/app/_components/icon/messengerIcon";
import MediaImage from "@/app/_components/shop/mediaImage/mediaImage";
import { toast } from "@/store/notification.store";
import { toErrorView } from "@/utils/apiError";
import { copyText } from "@/utils/clipboard";
import { toPersianDigits } from "@/utils/digits";
import { formatDate } from "@/utils/format";
import { withMappedError } from "@/utils/withMappedError";
import { BlogEndpoints } from "../../_api/blogEndpoints";
import { ERROR_BEHAVIOUR } from "../../_utils/apiError";
import PostBlocks from "../postBlocks/postBlocks";
import RelatedPosts from "../relatedPosts/relatedPosts";

/** A heading counts as «current» in the table of contents once it passes this line (design). */
const SPY_LINE = 140;

/** `blog-post.html` — reading progress, header, cover, TOC (scrollspy), prose, «مفید بود؟», author, share, related. */
export default function PostView({ slug }: { slug: string }) {
	const progressRef = useRef<HTMLDivElement>(null);
	const proseRef = useRef<HTMLDivElement>(null);
	const [activeAnchor, setActiveAnchor] = useState<string | null>(null);
	const [vote, setVote] = useState<boolean | null>(null);

	const post = useQuery({
		queryKey: ["blog", "post", slug],
		queryFn: () => withMappedError(() => BlogEndpoints.getPost(slug)),
		meta: { showNotificationOnRefetch: true },
	});

	const data = post.data;

	useEffect(() => {
		if (data) document.title = data.seo?.title ?? `${data.title} | بلاگ کیوا`;
	}, [data]);

	// reading progress bar + table-of-contents highlight (design scroll handler)
	useEffect(() => {
		if (!data) return;
		const onScroll = () => {
			const prose = proseRef.current;
			if (prose && progressRef.current) {
				const r = prose.getBoundingClientRect();
				const k = Math.min(1, Math.max(0, -r.top / (r.height - window.innerHeight * 0.6)));
				progressRef.current.style.width = `${k * 100}%`;
			}
			let current: string | null = null;
			prose?.querySelectorAll<HTMLElement>("h2[id]").forEach((h) => {
				if (current === null || h.getBoundingClientRect().top < SPY_LINE) current = h.id;
			});
			setActiveAnchor(current);
		};
		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, [data]);

	const feedback = useMutation({
		mutationFn: (helpful: boolean) => withMappedError(() => BlogEndpoints.sendFeedback(data?.id ?? 0, helpful)),
		meta: { showNotification: true },
	});

	const answer = (helpful: boolean) => {
		setVote(helpful);
		feedback.mutate(helpful);
		toast(helpful ? "ممنون از بازخوردت" : "ممنون! سعی می‌کنیم بهترش کنیم", { icon: "smile" });
	};

	// a missing post shows the site's 404 (like a missing product)
	if (post.error?.statusCode === 404) notFound();

	const postError = toErrorView(ERROR_BEHAVIOUR, post.error, "دریافت مقاله با خطا مواجه شد.");

	if (post.isLoading)
		return (
			<div className="container" style={{ paddingTop: "calc(var(--top) + 30px)" }}>
				<Loading />
			</div>
		);

	if (postError)
		return (
			<div className="container" style={{ paddingTop: "calc(var(--top) + 30px)" }}>
				<ErrorComponent
					retryable={postError.retryable}
					ticketAble={postError.ticketAble}
					errorText={postError.errorText}
					executeFunction={() => post.refetch()}
					loading={post.isFetching}
				/>
			</div>
		);

	if (!data) return null;

	const toc = data.toc ?? data.blocks.filter((b) => b.type === "HEADING" && b.anchor).map((b) => ({ anchor: b.anchor ?? "", title: b.text ?? "" }));

	return (
		<>
			<div className="progress" id="prog" ref={progressRef} />
			<header className="art-head container" id="head">
				<nav className="crumbs" aria-label="مسیر">
					<Link href="/">خانه</Link>
					<Icon name="left" />
					<Link href="/blog">بلاگ</Link>
					<Icon name="left" />
					<span>{data.category?.name}</span>
				</nav>
				<span className="tag tag-lg">{data.category?.name}</span>
				<h1>{data.title}</h1>
				<div className="art-meta">
					{data.author && (
						<span>
							<Icon name="user" />
							{data.author.name}
						</span>
					)}
					<span>
						<Icon name="cal" />
						{formatDate(data.publishedAt)}
					</span>
					<span>
						<Icon name="clock" />
						{toPersianDigits(data.readingMinutes)} دقیقه مطالعه
					</span>
				</div>
			</header>
			<div className="container">
				<Reveal className="art-cover" id="cover" style={data.coverBackground ? { background: data.coverBackground } : undefined}>
					<MediaImage src={data.cover?.url} alt={data.cover?.alt ?? data.title} cover eager />
				</Reveal>
				<div className="art-grid">
					<nav className="toc" id="toc" aria-label="فهرست مطالب">
						<h4>فهرست مطالب</h4>
						{toc.map((t) => (
							<a key={t.anchor} href={`#${t.anchor}`} className={classNames({ on: t.anchor === activeAnchor })}>
								{t.title}
							</a>
						))}
					</nav>
					<article>
						<div className="prose" id="prose" ref={proseRef}>
							<PostBlocks lead={data.lead} blocks={data.blocks} />
						</div>
						<div className="helpful">
							<span>این مطلب مفید بود؟</span>
							<button type="button" className={classNames("btn btn-outline btn-sm", { on: vote === true })} onClick={() => answer(true)}>
								<Icon name="smile" /> آره
							</button>
							<button type="button" className={classNames("btn btn-outline btn-sm", { on: vote === false })} onClick={() => answer(false)}>
								نه چندان
							</button>
						</div>
						{data.author && (
							<div className="author" id="author">
								<span className="av">{data.author.initial ?? data.author.name[0]}</span>
								<div>
									<b>{data.author.name}</b>
									{data.author.bio && <p>{data.author.bio}</p>}
								</div>
							</div>
						)}
					</article>
					<aside className="share">
						<h4>اشتراک‌گذاری</h4>
						<div className="row" id="share">
							{data.shareLinks?.map((l) => (
								<a key={l.channel} href={l.url} target="_blank" rel="noopener noreferrer" aria-label={l.name}>
									<MessengerIcon channel={l.channel} />
								</a>
							))}
							<button type="button" aria-label="کپی لینک" onClick={() => copyText(data.shareUrl ?? window.location.href, "لینک مقاله کپی شد")}>
								<Icon name="copy" />
							</button>
						</div>
					</aside>
				</div>
			</div>
			<RelatedPosts postId={data.id} />
		</>
	);
}
