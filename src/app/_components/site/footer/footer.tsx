import Link from "next/link";
import Logo from "@/app/_components/common/logo/logo";
import { Icon } from "@/app/_components/icon/icons";
import { MessengerIcon } from "@/app/_components/icon/messengerIcon";
import Newsletter from "@/app/_components/site/newsletter/newsletter";
import { FALLBACK_CONFIG, SUPPORT_HOURS_SUMMARY } from "@/config/site";
import { SiteConfig, TrustBadge } from "@/types/siteConfig.type";
import { formatDate } from "@/utils/format";

function TrustArt({ type }: { type: TrustBadge["type"] }) {
	return type === "SAMANDEHI" ? (
		<svg viewBox="0 0 48 48" aria-hidden="true">
			<circle cx="24" cy="24" r="20" fill="#F3EEFA" stroke="#5B3E8C" strokeWidth="2" />
			<path d="M16 25l5 5 11-12" fill="none" stroke="#5B3E8C" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	) : (
		<svg viewBox="0 0 48 48" aria-hidden="true">
			<path d="M24 4l5 4 6-1 2 6 5 3-2 6 2 6-5 3-2 6-6-1-5 4-5-4-6 1-2-6-5-3 2-6-2-6 5-3 2-6 6 1z" fill="#5B3E8C" />
			<path d="M24 14l2.8 5.7 6.2.9-4.5 4.4 1 6.2-5.5-2.9-5.5 2.9 1-6.2-4.5-4.4 6.2-.9z" fill="#fff" />
		</svg>
	);
}

/** «نماد اعتماد الکترونیکی» → «نماد اعتماد» / «الکترونیکی» (the design breaks the label before its last word). */
function twoLines(label: string) {
	const at = label.lastIndexOf(" ");
	return at < 0 ? label : (
		<>
			{label.slice(0, at)}
			<br />
			{label.slice(at + 1)}
		</>
	);
}

/** Newsletter box + `.kv-footer`. */
export default function Footer({ config }: { config: SiteConfig }) {
	const brand = config.brand ?? FALLBACK_CONFIG.brand!;
	const support = config.support ?? FALLBACK_CONFIG.support!;
	const social = config.social ?? FALLBACK_CONFIG.social ?? [];
	const groups = config.footerLinks ?? FALLBACK_CONFIG.footerLinks ?? [];
	const trust = config.trustBadges ?? FALLBACK_CONFIG.trustBadges ?? [];

	return (
		<>
			<Newsletter />
			<footer className="kv-footer">
				<div className="container">
					<div className="ft-grid">
						<div className="ft-brand">
							<Logo tone="white" />
							<div className="slogan">{brand.slogan}</div>
							<p>{brand.about}</p>
							<div className="ft-social">
								{social.map((s) => (
									<a key={s.channel} href={s.url} target="_blank" rel="noopener" aria-label={s.name} title={s.name}>
										<MessengerIcon channel={s.channel} mono />
									</a>
								))}
							</div>
						</div>
						{groups.map((g) => (
							<div key={g.group}>
								<h4>{g.group}</h4>
								<div className="ft-links">
									{g.links.map((l) => (
										<Link key={l.url} href={l.url}>
											{l.label}
										</Link>
									))}
								</div>
							</div>
						))}
						<div className="ft-contact-col">
							<h4>پشتیبانی</h4>
							<div className="ft-contact">
								<a href={`tel:${support.phone}`}>
									<span className="ci">
										<Icon name="phone" />
									</span>
									<span>
										<small>تلفن پشتیبانی</small>
										<b className="ltr" style={{ display: "inline-block" }}>
											{support.phoneDisplay}
										</b>
									</span>
								</a>
								<a href={`mailto:${support.email}`}>
									<span className="ci">
										<Icon name="mail" />
									</span>
									<span>
										<small>ایمیل</small>
										<b>{support.email}</b>
									</span>
								</a>
								<div>
									<span className="ci">
										<Icon name="clock" />
									</span>
									<span>
										<small>ساعت پاسخگویی</small>
										<b>{SUPPORT_HOURS_SUMMARY}</b>
									</span>
								</div>
							</div>
							<div className="ft-trust" style={{ marginTop: 20 }}>
								{trust.map((t) => (
									<a key={t.type} className="trust" href={t.linkUrl ?? "#"} title={t.label}>
										<TrustArt type={t.type} />
										<span>{twoLines(t.label)}</span>
									</a>
								))}
							</div>
						</div>
					</div>
					<div className="ft-bottom">
						{/* static pages render the year at build time; the client may be past Nowruz */}
						<span suppressHydrationWarning>
							© {formatDate(Date.now(), { year: "numeric" })} {brand.name} — تمامی حقوق محفوظ است.
						</span>
						<span>{brand.slogan.replace(/\.$/, "")}</span>
					</div>
				</div>
			</footer>
		</>
	);
}
