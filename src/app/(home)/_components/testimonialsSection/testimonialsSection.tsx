"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import classNames from "classnames";
import Reveal from "@/app/_components/common/reveal/reveal";
import { Icon } from "@/app/_components/icon/icons";
import { MessengerIcon } from "@/app/_components/icon/messengerIcon";
import MediaImage from "@/app/_components/shop/mediaImage/mediaImage";
import ScrollNav from "@/app/_components/shop/scrollNav/scrollNav";
import Stars from "@/app/_components/shop/stars/stars";
import { toPersianDigits } from "@/utils/digits";
import { formatPrice } from "@/utils/format";
import { TestimonialListResponse } from "../../_types/home.type";

/** `4.9` → `۴٫۹` (Persian decimal separator). */
const decimal = (n: number) => toPersianDigits(String(n)).replace(".", "٫");

/** «از زبون خودشون» — satisfaction summary + messenger-style cards with paging dots. */
export default function TestimonialsSection({ testimonials }: { testimonials: TestimonialListResponse }) {
	const { summary, items } = testimonials;
	const row = useRef<HTMLDivElement>(null);
	const [pages, setPages] = useState(1);
	const [page, setPage] = useState(0);

	// dots = how many "screens" of cards there are; the active one follows the scroll position
	const measure = useCallback(() => {
		const el = row.current;
		const card = el?.firstElementChild as HTMLElement | null;
		if (!el || !card) return;
		const perView = Math.max(1, Math.round(el.clientWidth / card.getBoundingClientRect().width));
		const n = Math.ceil(items.length / perView);
		const max = el.scrollWidth - el.clientWidth;
		setPages(n);
		setPage(max > 0 ? Math.round((Math.abs(el.scrollLeft) / max) * (n - 1)) : 0);
	}, [items.length]);

	useEffect(() => {
		const el = row.current;
		if (!el) return;
		let t: ReturnType<typeof setTimeout>;
		const debounced = (ms: number) => () => {
			clearTimeout(t);
			t = setTimeout(measure, ms);
		};
		const onScroll = debounced(60);
		const onResize = debounced(200);
		const first = setTimeout(measure, 0);
		el.addEventListener("scroll", onScroll, { passive: true });
		window.addEventListener("resize", onResize);
		return () => {
			clearTimeout(t);
			clearTimeout(first);
			el.removeEventListener("scroll", onScroll);
			window.removeEventListener("resize", onResize);
		};
	}, [measure]);

	const goTo = (i: number) => {
		const el = row.current;
		if (!el) return;
		const max = el.scrollWidth - el.clientWidth;
		el.scrollTo({ left: -(max * i) / Math.max(1, pages - 1), behavior: "smooth" });
	};

	return (
		<section className="section" aria-labelledby="tT">
			<div className="container">
				<Reveal className="sec-head">
					<div>
						<span className="eyebrow">
							<Icon name="heart" /> پیام‌های رضایت
						</span>
						<h2 id="tT">از زبون خودشون</h2>
						<p>پیام‌هایی که مشتری‌ها بعد از رسیدن کیفشون توی پیام‌رسان‌ها برامون فرستادن.</p>
					</div>
					<ScrollNav target={row} step={0.9} />
				</Reveal>
				<div className="testi-wrap">
					<Reveal as="aside" className="t-sum" aria-label="خلاصه رضایت">
						<div className="t-score">
							<b>{decimal(summary.averageRating)}</b>
							<span>از {toPersianDigits(summary.scale)}</span>
						</div>
						<div className="stars" aria-label="۵ ستاره">
							<Stars value={5} outlined={false} />
						</div>
						<p>بر اساس {formatPrice(summary.totalCount)} نظر و پیام ثبت‌شده</p>
						<div className="t-bars">
							{summary.metrics.map((m) => (
								<div key={m.key} className="t-bar" style={{ "--w": `${m.percent}%` } as React.CSSProperties}>
									<div>
										<span>{m.label}</span>
										<b>{toPersianDigits(m.percent)}٪</b>
									</div>
									<i />
								</div>
							))}
						</div>
						<div className="t-src">
							پیام‌ها از
							<span>
								{summary.sources.map((s) => (
									<MessengerIcon key={s} channel={s} />
								))}
							</span>
						</div>
					</Reveal>
					<Reveal className="h-scroll t-row" delay={0.1} id="tRow" ref={row}>
						{items.map((t) => (
							<article key={t.id} className="tcard">
								<div className="tc-h">
									<span className="av">{t.customerInitial}</span>
									<div>
										<b>{t.customerName}</b>
										<small>{t.city}</small>
									</div>
									<span className="src">
										<MessengerIcon channel={t.source} />
										{t.sourceName}
									</span>
								</div>
								<div className="tc-msg">
									<p>{t.message}</p>
									<time>
										{toPersianDigits(t.messageTime)} <Icon name="check" />
									</time>
								</div>
								<div className="tc-f">
									<Link className="th" href={`/product/${t.product.slug}?color=${t.color.key}`} aria-label={t.product.name}>
										<MediaImage src={t.product.imageUrl} alt={t.product.name} />
									</Link>
									<div>
										<small>کیف خریداری‌شده</small>
										<b>{t.product.name}</b>
									</div>
									<span className="stars" aria-label={`${toPersianDigits(t.rating)} ستاره`}>
										<Stars value={t.rating} outlined={false} />
									</span>
								</div>
							</article>
						))}
					</Reveal>
				</div>
				<div className="t-dots" id="tDots" role="tablist" aria-label="صفحه نظرات">
					{Array.from({ length: pages }, (_, i) => (
						<button key={i} type="button" className={classNames({ on: i === page })} aria-label={`صفحه ${toPersianDigits(i + 1)}`} onClick={() => goTo(i)} />
					))}
				</div>
			</div>
		</section>
	);
}
