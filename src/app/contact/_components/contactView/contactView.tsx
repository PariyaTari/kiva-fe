"use client";

import Link from "next/link";
import classNames from "classnames";
import { useQuery } from "@tanstack/react-query";
import Reveal from "@/app/_components/common/reveal/reveal";
import { Icon } from "@/app/_components/icon/icons";
import { MessengerIcon } from "@/app/_components/icon/messengerIcon";
import { SiteEndpoints } from "@/app/_components/site/_api/siteEndpoints";
import { FALLBACK_CONFIG, SUPPORT_HOURS_SUMMARY } from "@/config/site";
import { toPersianDigits } from "@/utils/digits";
import { withMappedError } from "@/utils/withMappedError";
import ContactForm from "../contactForm/contactForm";

/** The «پیام‌رسان» card and list, in the design's order. */
const LIST_CHANNELS = ["RUBIKA", "BALE", "TELEGRAM", "INSTAGRAM"];

/** `09:00` → `۹:۰۰`. */
const clock = (t?: string | null) => (t ? toPersianDigits(t.replace(/^0/, "")) : "");

/** Body of `contact.html` — the three contact cards, the form, messengers + support hours, and the FAQ nudge. */
export default function ContactView({ initialTopic }: { initialTopic?: string }) {
	// same query as the shell's header/footer; until it answers, the design's static values
	const config = useQuery({
		queryKey: ["site", "config"],
		queryFn: () => withMappedError(() => SiteEndpoints.getConfig()),
	});
	const { support, social = [] } = config.data ?? FALLBACK_CONFIG;
	const messengers = LIST_CHANNELS.map((c) => social.find((s) => s.channel === c)).filter((s) => !!s);
	const bale = social.find((s) => s.channel === "BALE") ?? messengers[0];

	return (
		<>
			<div className="container">
				<div className="c-cards">
					{support && (
						<>
							<Reveal as="a" className="c-card" href={`tel:${support.phone}`}>
								<span className="ci">
									<Icon name="phone" />
								</span>
								<small>تلفن پشتیبانی</small>
								<b className="ltr">{support.phoneDisplay}</b>
								<span>{SUPPORT_HOURS_SUMMARY}</span>
							</Reveal>
							<Reveal as="a" className="c-card" delay={0.06} href={`mailto:${support.email}`}>
								<span className="ci">
									<Icon name="mail" />
								</span>
								<small>ایمیل</small>
								<b>{support.email}</b>
								<span>{support.emailResponseHint ?? "پاسخ تا ۲۴ ساعت"}</span>
							</Reveal>
						</>
					)}
					{bale && (
						<Reveal as="a" className="c-card" delay={0.12} href={bale.url} target="_blank" rel="noopener noreferrer">
							<span className="ci">
								<Icon name="chat" />
							</span>
							<small>پیام‌رسان</small>
							<b>{bale.handle}</b>
							<span>بله، روبیکا، تلگرام</span>
						</Reveal>
					)}
				</div>
			</div>

			<section className="section">
				<div className="container c-grid">
					<ContactForm initialTopic={initialTopic} />

					<div className="side-c">
						<Reveal className="msg-box">
							<h3>سریع‌ترین راه: پیام‌رسان</h3>
							<p>عکس یا ویدیوی بیشتر از یه کیف خواستی؟ همین‌جا پیام بده.</p>
							<div className="msg-list" id="msgList">
								{messengers.map((m) => (
									<a key={m.channel} href={m.url} target="_blank" rel="noopener noreferrer">
										<MessengerIcon channel={m.channel} />
										<span>
											{m.name}
											<small>{m.handle}</small>
										</span>
									</a>
								))}
							</div>
						</Reveal>
						<Reveal className="card" delay={0.12}>
							<h3 style={{ fontSize: 16, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
								ساعت پاسخگویی
								{support?.isOpenNow !== undefined && (
									<span className={classNames("tag open-now", support.isOpenNow ? "tag-success" : "tag-warn")} id="openNow">
										{support.isOpenNow ? "الان پاسخگوییم" : "خارج از ساعت کاری"}
									</span>
								)}
							</h3>
							<div className="hours">
								{(support?.hours ?? []).map((h) => (
									<div key={h.label}>
										<span>{h.label}</span>
										{h.messengerOnly ? (
											<b className="muted">فقط پیام‌رسان</b>
										) : (
											<b>
												{clock(h.from)} تا {clock(h.to)}
											</b>
										)}
									</div>
								))}
							</div>
						</Reveal>
					</div>
				</div>
				<div className="container">
					<Reveal className="box-cream faq-cta">
						<span className="ic">
							<Icon name="info" />
						</span>
						<div>
							<b>شاید جوابت این‌جا باشه</b>
							<p style={{ fontSize: 13, color: "#6b5a48" }}>ارسال، رزرو ۴ روزه، بازگشت کالا و عکس قبل از ارسال</p>
						</div>
						<Link className="btn btn-dark" href="/faq">
							سوالات متداول
						</Link>
					</Reveal>
				</div>
			</section>
		</>
	);
}
