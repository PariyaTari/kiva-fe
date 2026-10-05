"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import classNames from "classnames";
import { Icon } from "@/app/_components/icon/icons";
import { MessengerIcon } from "@/app/_components/icon/messengerIcon";
import MediaImage from "@/app/_components/shop/mediaImage/mediaImage";
import { toPersianDigits } from "@/utils/digits";
import { formatPrice } from "@/utils/format";
import { HomePage } from "../../_types/home.type";

const ROTATE_MS = 3200;

/** «هرچی ببینی، همون می‌رسه.» → «هرچی ببینی،» ⏎ «<em>همون</em> می‌رسه.» — the design's headline treatment. */
function Headline({ title }: { title: string }) {
	const [first, rest] = title.split(/(?<=،)\s*/);
	if (!rest) return <>{title}</>;
	const [accent, ...tail] = rest.split(" ");
	return (
		<>
			{first}
			<br />
			<em>{accent}</em> {tail.join(" ")}
		</>
	);
}

/** Hero: fixed copy + the «روی سایت دیدی = قبل از ارسال فرستادیم» visual; the bag's colours rotate in both cards together. */
export default function HeroSection({ hero }: { hero: HomePage["hero"] }) {
	const product = hero.showcaseProduct;
	const colors = product.colors;
	const start = Math.max(0, colors.findIndex((c) => c.color.key === product.displayColorKey));
	const [current, setCurrent] = useState(start);
	const timer = useRef<ReturnType<typeof setInterval> | null>(null);

	const loop = () => {
		if (timer.current) clearInterval(timer.current);
		if (window.matchMedia("(prefers-reduced-motion:reduce)").matches) return;
		timer.current = setInterval(() => setCurrent((i) => (i + 1) % colors.length), ROTATE_MS);
	};

	useEffect(() => {
		loop();
		return () => {
			if (timer.current) clearInterval(timer.current);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps -- start the rotation once
	}, []);

	const pick = (i: number) => {
		setCurrent(i);
		loop();
	};

	// both cards show the same frames; non-current ones fade out (`.fr.out`)
	const frames = colors.map((c, i) => (
		<div key={c.color.key} className={classNames("fr", { out: i !== current })}>
			<MediaImage src={c.imageUrl} alt={`${product.name} رنگ ${c.color.name}`} eager={i === current} />
		</div>
	));

	return (
		<section className="hero" aria-label="بنر">
			<div className="container hero-in">
				<div className="hero-text">
					<span className="eyebrow-pill">
						<Icon name="camera" />
						{hero.eyebrow}
					</span>
					<h1>
						<Headline title={hero.title} />
					</h1>
					<p>{hero.text}</p>
					<div className="hero-cta">
						<Link className="btn btn-primary btn-lg" href={hero.primaryCta.url}>
							{hero.primaryCta.label} <Icon name="arrow" />
						</Link>
						<a className="btn btn-white btn-lg" href={hero.secondaryCta.url}>
							{hero.secondaryCta.label}
						</a>
					</div>
				</div>
				<div className="hero-art" id="heroArt">
					<span className="grid-bg" aria-hidden="true" />
					<div className="eq-card site">
						<span className="eq-label">
							<Icon name="eye" />
							روی سایت دیدی
						</span>
						<div className="bar" aria-hidden="true">
							<i />
							<i />
							<i />
							<span>kiva.ir/product</span>
						</div>
						<div className="eq-img">{frames}</div>
						<div className="meta">
							<div>
								<b>{product.name}</b>
								<small>{product.category.name}</small>
							</div>
							<span className="pr">
								{formatPrice(product.price.price)} <small>تومان</small>
							</span>
						</div>
						<div className="sw" role="radiogroup" aria-label="رنگ کیف">
							{colors.map((c, i) => (
								<button
									key={c.color.key}
									type="button"
									className={classNames({ on: i === current })}
									style={{ background: c.color.hex }}
									role="radio"
									aria-checked={i === current}
									aria-label={c.color.name}
									title={c.color.name}
									onClick={() => pick(i)}
								/>
							))}
							<small>
								رنگ: <b>{colors[current]?.color.name}</b>
							</small>
						</div>
					</div>
					<span className="eq-sign" aria-hidden="true">
						=
					</span>
					<div className="eq-card chat">
						<span className="eq-label" style={{ background: "var(--purple)" }}>
							<Icon name="camera" />
							قبل از ارسال فرستادیم
						</span>
						<div className="top">
							<MessengerIcon channel={hero.showcaseMessenger} />
							<span>
								<b>کیوا</b>
								<small>آنلاین</small>
							</span>
						</div>
						<div className="body">
							<div className="bubble">
								<div className="eq-img">{frames}</div>
								<p>این کیف خودته؛ همین الان برات کنار گذاشتیمش.</p>
								<time>
									{toPersianDigits("10:24")} <Icon name="check" />
								</time>
							</div>
							<div className="reply">عالیه، همونه!</div>
						</div>
					</div>
					<div className="eq-done">
						<span className="ok">
							<Icon name="check" />
						</span>
						<span>
							<b>همونی که دیدی، رسید</b>
							<small>تحویل · ۲ روز بعد</small>
						</span>
					</div>
				</div>
			</div>
		</section>
	);
}
