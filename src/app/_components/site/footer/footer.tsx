import { ComponentType } from "react";
import Link from "next/link";
import moment from "jalali-moment";
import Logo from "@/app/_components/common/logo/logo";
import { svgIcon } from "@/app/_components/icon/icon.types";
import { FOOTER_GROUPS } from "@/app/_components/site/nav";
import { BRAND, MessengerKey, SOCIAL_LINKS, SUPPORT } from "@/config/site";
import { toPersianDigits } from "@/utils/digits";
import {
	IconBale,
	IconClock,
	IconInstagram,
	IconMail,
	IconPhone,
	IconRubika,
	IconTelegram,
} from "@/app/_components/icon/icons";

const SOCIAL_ICONS: Record<MessengerKey, ComponentType<svgIcon>> = {
	rubika: IconRubika,
	bale: IconBale,
	telegram: IconTelegram,
	instagram: IconInstagram,
};

const CONTACT_ICON =
	"grid h-[38px] w-[38px] shrink-0 place-items-center rounded-xl bg-white/[0.07] text-primary-300";

export default function Footer() {
	const year = toPersianDigits(moment().format("jYYYY"));

	return (
		<footer className="mt-20 rounded-t-3xl bg-primary-900 text-sm text-white/70 dark:border-t dark:border-theme-border dark:bg-surface">
			<div className="mx-auto max-w-container px-4 pt-16 sm:px-6">
				<div className="grid grid-cols-2 gap-8 pb-11 lg:grid-cols-[1.5fr_1fr_1fr_1.3fr] lg:gap-10">
					{/* Brand */}
					<div className="col-span-2 lg:col-span-1">
						<Logo tone="white" markClassName="h-[34px]" />
						<p className="mt-[18px] text-[19px] font-bold text-white">{BRAND.slogan}</p>
						<p className="mt-2.5 max-w-xs text-[13.5px] leading-8">{BRAND.about}</p>
						<div className="mt-[22px] flex gap-2.5">
							{SOCIAL_LINKS.map((social) => {
								const Icon = SOCIAL_ICONS[social.key];
								return (
									<a
										key={social.key}
										href={social.url}
										target="_blank"
										rel="noopener noreferrer"
										aria-label={social.label}
										title={social.label}
										className="grid h-11 w-11 place-items-center rounded-[14px] bg-white/[0.07] text-white transition-all duration-300 ease-kiva-bounce hover:-translate-y-[3px] hover:bg-primary-300 hover:text-primary-900"
									>
										<Icon width={24} height={24} />
									</a>
								);
							})}
						</div>
					</div>

					{/* Link columns */}
					{FOOTER_GROUPS.map((group) => (
						<div key={group.title}>
							<h4 className="mb-4 text-[15px] font-bold text-white">{group.title}</h4>
							<ul className="grid gap-2.5 text-[13.5px]">
								{group.items.map((item) => (
									<li key={item.href}>
										<Link href={item.href} className="transition-colors hover:text-white">
											{item.label}
										</Link>
									</li>
								))}
							</ul>
						</div>
					))}

					{/* Support */}
					<div className="col-span-2 lg:col-span-1">
						<h4 className="mb-4 text-[15px] font-bold text-white">پشتیبانی</h4>
						<div className="grid gap-3.5">
							<a href={`tel:${SUPPORT.phone}`} className="flex items-center gap-3">
								<span className={CONTACT_ICON}>
									<IconPhone width={18} height={18} />
								</span>
								<span>
									<small className="block text-[11.5px] text-white/45">تلفن پشتیبانی</small>
									<b className="dir-ltr inline-block font-semibold text-white">{SUPPORT.phoneDisplay}</b>
								</span>
							</a>
							<a href={`mailto:${SUPPORT.email}`} className="flex items-center gap-3">
								<span className={CONTACT_ICON}>
									<IconMail width={18} height={18} />
								</span>
								<span>
									<small className="block text-[11.5px] text-white/45">ایمیل</small>
									<b className="font-semibold text-white">{SUPPORT.email}</b>
								</span>
							</a>
							<div className="flex items-center gap-3">
								<span className={CONTACT_ICON}>
									<IconClock width={18} height={18} />
								</span>
								<span>
									<small className="block text-[11.5px] text-white/45">ساعت پاسخگویی</small>
									<b className="font-semibold text-white">{SUPPORT.hours}</b>
								</span>
							</div>
						</div>
					</div>
				</div>

				<div className="flex flex-col items-center justify-between gap-2 border-t border-white/[0.08] py-5 text-center text-[12.5px] text-white/45 sm:flex-row">
					{/* static pages render the year at build time; the client may be past Nowruz */}
					<span suppressHydrationWarning>
						© {year} {BRAND.name} — تمامی حقوق محفوظ است.
					</span>
					<span>{BRAND.slogan}</span>
				</div>
			</div>
		</footer>
	);
}
