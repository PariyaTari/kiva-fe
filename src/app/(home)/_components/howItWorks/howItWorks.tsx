"use client";

import { useId } from "react";
import Link from "next/link";
import classNames from "classnames";
import Reveal from "@/app/_components/common/reveal/reveal";
import { Icon } from "@/app/_components/icon/icons";
import { MessengerIcon } from "@/app/_components/icon/messengerIcon";
import BagArt from "@/app/_components/shop/bagArt/bagArt";
import { bagMarkup } from "@/app/_components/shop/bagArt/bagMarkup";
import { toPersianDigits } from "@/utils/digits";
import { HowItWorksStep } from "../../_types/home.type";

/** Step 3 art — the bag dropping into a Kiva box. */
function BoxArt() {
	const uid = "kb" + useId().replace(/[^a-zA-Z0-9]/g, "");
	return (
		<svg viewBox="0 0 170 160">
			<g transform="translate(37 -6) scale(.48)" dangerouslySetInnerHTML={{ __html: bagMarkup("hobo", "lilac", 0, uid) }} />
			<path d="M25 70 L85 52 L145 70 L145 132 L85 150 L25 132 Z" fill="#F5EDE3" stroke="#2A1F3D" strokeWidth="1.5" strokeLinejoin="round" />
			<path d="M25 70 L85 88 L145 70 M85 88 V150" fill="none" stroke="#2A1F3D" strokeWidth="1.5" strokeLinejoin="round" />
			<path d="M25 70 L8 92 L68 110 L85 88 Z" fill="#E8DCCB" stroke="#2A1F3D" strokeWidth="1.5" strokeLinejoin="round" />
			<path d="M145 70 L162 92 L102 110 L85 88 Z" fill="#E8DCCB" stroke="#2A1F3D" strokeWidth="1.5" strokeLinejoin="round" />
			<path d="M112 118 c-4-6-14-3-10 5 l10 9 10-9 c4-8-6-11-10-5z" fill="#5B3E8C" />
			<text x="52" y="128" fontFamily="yekanBakh, Vazirmatn" fontWeight="900" fontSize="15" fill="#5B3E8C">
				kiva
			</text>
		</svg>
	);
}

/** Per-step illustration (the texts come from the API, the art belongs to the design). */
function StepVisual({ index }: { index: number }) {
	if (index === 0)
		return (
			<div className="phone">
				<div className="scr">
					<span>
						<BagArt type="satchel" color="caramel" />
					</span>
					<span className="pl">
						<Icon name="play" />
					</span>
				</div>
			</div>
		);
	if (index === 1)
		return (
			<div className="mchat">
				<div className="bb">
					<div className="ph">
						<BagArt type="satchel" color="caramel" />
					</div>
					<p>این کیف خودته</p>
				</div>
				<div className="me">عالیه، همونه! ✓✓</div>
				<div className="ms">
					{["RUBIKA", "TELEGRAM", "BALE"].map((c) => (
						<MessengerIcon key={c} channel={c} />
					))}
				</div>
			</div>
		);
	return (
		<div className="box-art">
			<BoxArt />
		</div>
	);
}

/** «چطور کار می‌کنیم» — the dark three-step band. */
export default function HowItWorks({ steps }: { steps: HowItWorksStep[] }) {
	return (
		<section className="section" id="how" aria-labelledby="howT" style={{ paddingTop: 20 }}>
			<div className="container">
				<div className="how">
					<Reveal className="sec-head center-head">
						<span className="eyebrow">
							<Icon name="sparkle" /> چطور کار می‌کنیم
						</span>
						<h2 id="howT">هرچی ببینی، همون می‌رسه</h2>
						<p>سه قدم ساده که فاصله‌ی «توی عکس» و «توی دستت» رو صفر می‌کنه.</p>
					</Reveal>
					<div className="steps">
						<div className="steps-line" aria-hidden="true">
							<svg viewBox="0 0 100 20" preserveAspectRatio="none">
								<path d="M0 10 Q25 -4 50 10 T100 10" fill="none" stroke="#C8B6E2" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
							</svg>
						</div>
						{steps.map((s, i) => (
							<Reveal key={s.step} className={classNames("hstep", { key: s.isSignature })} delay={i * 0.15}>
								<div className="vis">
									<span className="num">{toPersianDigits(s.step)}</span>
									<StepVisual index={i} />
									{s.isSignature && (
										<span className="badge tag tag-lg" style={{ background: "var(--lilac)", borderColor: "var(--lilac)", color: "var(--ink)" }}>
											امضای کیوا
										</span>
									)}
								</div>
								<h3>{s.title}</h3>
								<p>{s.text}</p>
							</Reveal>
						))}
					</div>
					<div className="how-cta">
						<Link className="btn btn-white btn-lg" href="/products">
							شروع خرید <Icon name="arrow" />
						</Link>
						<Link className="btn btn-lg btn-ghost-light" href="/track">
							پیگیری سفارش
						</Link>
					</div>
				</div>
			</div>
		</section>
	);
}
