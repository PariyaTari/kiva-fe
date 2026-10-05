"use client";

import { Fragment } from "react";
import Link from "next/link";
import classNames from "classnames";
import Reveal from "@/app/_components/common/reveal/reveal";
import { Icon } from "@/app/_components/icon/icons";
import { MessengerIcon } from "@/app/_components/icon/messengerIcon";
import { toPersianDigits } from "@/utils/digits";
import { Banner } from "../../_types/home.type";

/** Splits a banner title on `\n` into the design's `<br>`-broken lines. */
function Lines({ text }: { text: string }) {
	const lines = text.split("\n");
	return (
		<>
			{lines.map((line, i) => (
				<Fragment key={i}>
					{i > 0 && <br />}
					{line}
				</Fragment>
			))}
		</>
	);
}

/** Two photo banners — cream (reservation) and purple (pre-shipment photo). */
export default function PromoBanners({ promos }: { promos: Banner[] }) {
	return (
		<section className="section-sm">
			<div className="container promos">
				{promos.map((b, i) => {
					const purple = b.theme === "PURPLE";
					return (
						<Reveal key={b.id} className={classNames("promo", purple ? "p2" : "p1")} delay={i * 0.1}>
							<div className="tx">
								{b.tag && (
									<span className={classNames("tag", { "tag-cream": !purple })}>
										<Icon name={b.tag.icon} /> {b.tag.label}
									</span>
								)}
								<h3>
									<Lines text={b.title} />
								</h3>
								<p>{b.text}</p>
								{b.cta.url.startsWith("#") ? (
									<a className={classNames("btn btn-sm", purple ? "btn-white" : "btn-dark")} href={b.cta.url}>
										{b.cta.label} <Icon name="arrow" />
									</a>
								) : (
									<Link className={classNames("btn btn-sm", purple ? "btn-white" : "btn-dark")} href={b.cta.url}>
										{b.cta.label} <Icon name="arrow" />
									</Link>
								)}
							</div>
							<div className="ph">
								{/* eslint-disable-next-line @next/next/no-img-element -- remote campaign photo (CDN) */}
								<img
									src={b.image.url}
									alt={b.image.alt ?? ""}
									loading="lazy"
									onError={(e) => {
										e.currentTarget.style.opacity = "0";
									}}
								/>
								{b.overlay && (
									<span className="lbl">
										{b.overlay.channel && <MessengerIcon channel={b.overlay.channel} />}
										{b.overlay.highlight && <span className="n">{toPersianDigits(b.overlay.highlight)}</span>}
										<span>
											{b.overlay.title}
											<small>{b.overlay.subtitle}</small>
										</span>
									</span>
								)}
							</div>
						</Reveal>
					);
				})}
			</div>
		</section>
	);
}
