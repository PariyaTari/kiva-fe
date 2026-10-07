import Link from "next/link";
import { Icon } from "@/app/_components/icon/icons";
import { MessengerIcon } from "@/app/_components/icon/messengerIcon";
import MediaImage from "@/app/_components/shop/mediaImage/mediaImage";
import { toPersianDigits } from "@/utils/digits";
import { HomePage } from "../../_types/home.type";

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

/**
 * Hero: copy + the «روی سایت دیدی = قبل از ارسال فرستادیم» visual. Static by design (`HeroShowcase` of the project):
 * one picture from `/kiva-configs/hero.svg` in both cards, and labels instead of the design's live price and colour
 * picker — nothing in it can drift from the catalogue.
 */
export default function HeroSection({ hero }: { hero: HomePage["hero"] }) {
	const { showcase } = hero;
	const picture = (
		<div className="fr">
			<MediaImage src={showcase.image.url} alt={showcase.image.alt} eager />
		</div>
	);

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
						<div className="eq-img">{picture}</div>
						<div className="meta">
							<div>
								<b>{showcase.name}</b>
								<small>{showcase.category}</small>
							</div>
							<span className="real">
								<Icon name="camera" /> عکس واقعی
							</span>
						</div>
						<div className="sw">
							<i className="dot" style={{ background: showcase.colorHex }} aria-hidden="true" />
							<small>
								رنگ: <b>{showcase.colorName}</b>
							</small>
							<small className="raw">بدون ادیت</small>
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
							<MessengerIcon channel={showcase.messenger} />
							<span>
								<b>کیوا</b>
								<small>آنلاین</small>
							</span>
						</div>
						<div className="body">
							<div className="bubble">
								<div className="eq-img">{picture}</div>
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
