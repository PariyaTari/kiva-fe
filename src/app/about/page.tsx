import "./_styles/about.css";
import Link from "next/link";
import type { Metadata } from "next";
import Reveal from "@/app/_components/common/reveal/reveal";
import { Icon } from "@/app/_components/icon/icons";
import { IconName } from "@/app/_components/icon/icon.types";
import BagArt from "@/app/_components/shop/bagArt/bagArt";
import { BagKey } from "@/app/_components/shop/bagArt/bagArt.type";
import PhotosTile from "./_components/photosTile/photosTile";
import StatCounters from "./_components/statCounters/statCounters";

export const metadata: Metadata = {
	title: "درباره ما",
};

const VALUES: { icon: IconName; title: string; text: string }[] = [
	{ icon: "camera", title: "شفافیت کامل", text: "عکس و ویدیوی واقعی، بدون فیلتر. و قبل از ارسال، عکس کیف خودت." },
	{ icon: "award", title: "کیفیت بی‌تعارف", text: "هر کیف قبل از بسته‌بندی، دوخت، یراق و آسترش چک می‌شه." },
	{ icon: "clock", title: "احترام به وقتت", text: "ورود بدون رمز، رزرو ۴ روزه و ارسال سریع با تیپاکس یا پست." },
	{ icon: "leaf", title: "طراحی ماندگار", text: "فرم‌های مینیمال که مد روز نمی‌شن و از مد هم نمی‌افتن." },
];

const TIMELINE: { icon: IconName; year: string; title: string; text: string }[] = [
	{ icon: "sparkle", year: "۱۴۰۱", title: "شروع با یه پیج", text: "۶ مدل کیف دست‌دوز" },
	{ icon: "home", year: "۱۴۰۲", title: "اولین کارگاه", text: "تیم ۴ نفره و چرم انتخابی" },
	{ icon: "camera", year: "۱۴۰۳", title: "عکس قبل از ارسال", text: "تولد امضای کیوا" },
	{ icon: "timer", year: "۱۴۰۴", title: "رزرو ۴ روزه", text: "چند خرید، یک هزینه ارسال" },
	{ icon: "bag", year: "۱۴۰۵", title: "فروشگاه آنلاین", text: "همه‌چیز یکجا، با پیگیری لحظه‌ای" },
];

const PROCESS: { n: string; bag: BagKey; color: string; title: string; text: string }[] = [
	{ n: "۰۱", bag: "wallet", color: "caramel", title: "انتخاب متریال", text: "چرم و پارچه رو خودمون از نزدیک انتخاب می‌کنیم." },
	{ n: "۰۲", bag: "cross", color: "black", title: "دوخت و تولید", text: "تولید در کارگاه‌های کوچیک با استادکارهای باتجربه." },
	{ n: "۰۳", bag: "bucket", color: "olive", title: "کنترل کیفیت", text: "دوخت، یراق، آستر و زیپ؛ یکی‌یکی چک می‌شن." },
	{ n: "۰۴", bag: "hobo", color: "lilac", title: "عکس و ارسال", text: "عکس کیف خودت، بسته‌بندی کیوا و تحویل." },
];

/** About — design `about.html` (brand story is static copy; the counters come from `GET /site/stats`). */
export default function AboutPage() {
	return (
		<div className="pg-about">
			<main>
				<section className="ab-hero">
					<div className="container ab-in">
						<Reveal>
							<span className="tag tag-lg">درباره کیوا</span>
							<h1>
								ما کیف نمی‌فروشیم،
								<br />
								<em>اعتماد</em> می‌فرستیم.
							</h1>
							<p>
								کیوا از یه دغدغه ساده شروع شد: چرا چیزی که آنلاین می‌خریم، با چیزی که به دستمون می‌رسه فرق داره؟ جوابمون یه قول بود که تا امروز سرش هستیم — هرچی
								ببینی، همون می‌رسه.
							</p>
						</Reveal>
						<Reveal className="ab-art" delay={0.15}>
							<div className="frame" />
							<div className="blob" />
							<div className="b" style={{ width: "56%", right: "22%", top: "26%" }}>
								<BagArt type="satchel" color="purple" />
							</div>
							<div className="polaroid" style={{ bottom: "8%", left: 0 }}>
								<div className="ph">
									<BagArt type="satchel" color="purple" />
								</div>
								<span>قبل از ارسال ✓</span>
							</div>
						</Reveal>
					</div>
				</section>

				<section className="section">
					<div className="container story">
						<Reveal className="mosaic">
							<div className="m1">
								<span>
									<BagArt type="satchel" color="caramel" />
								</span>
								<span className="cap">کارگاه کیوا</span>
							</div>
							<div className="m2">
								<span>
									<BagArt type="cross" color="black" />
								</span>
							</div>
							<PhotosTile />
						</Reveal>
						<Reveal delay={0.1}>
							<span className="sec-head" style={{ display: "block", margin: 0 }}>
								<span className="eyebrow">
									<Icon name="feather" /> داستان ما
								</span>
							</span>
							<h2>از یه پیج کوچیک تا خونه‌ی کیف‌های مینیمال</h2>
							<p>سال ۱۴۰۱، با چند مدل کیف دست‌دوز و یه گوشی موبایل شروع کردیم. همون روزهای اول فهمیدیم بزرگ‌ترین نگرانی مشتری‌ها «فرق عکس با واقعیت» بود.</p>
							<p>برای همین تصمیم گرفتیم قبل از ارسال هر سفارش، از همون کیفی که برای مشتری کنار گذاشتیم عکس و ویدیو بگیریم و براش بفرستیم. این کار ساده، امضای کیوا شد.</p>
							<p>امروز با یه تیم کوچیک و یه کارگاه پر از چرم و نخ، هر کیف رو با وسواس انتخاب، کنترل و بسته‌بندی می‌کنیم.</p>
							<div className="sign">
								<span className="av">ک</span>
								<span>
									<b>تیم کیوا</b>
									<small>تهران، پاییز ۱۴۰۵</small>
								</span>
							</div>
						</Reveal>
					</div>
				</section>

				<section className="section-sm">
					<div className="container">
						<Reveal className="manifesto">
							<span className="ey">قول ما به تو</span>
							<p className="big">
								هرچی ببینی، <em>همون</em> می‌رسه.
							</p>
							<p className="sub">این جمله برای ما شعار تبلیغاتی نیست؛ معیاریه که هر سفارش قبل از ارسال باهاش سنجیده می‌شه.</p>
							<div className="m-row">
								<div>
									<b>عکس و ویدیوی واقعی</b>
									<span>بدون فیلتر و ادیت اغراق‌آمیز</span>
								</div>
								<div>
									<b>عکس قبل از ارسال</b>
									<span>از همون کیفی که برات کنار گذاشتیم</span>
								</div>
								<div>
									<b>۷ روز ضمانت بازگشت</b>
									<span>اگه همونی نبود که دیدی</span>
								</div>
							</div>
						</Reveal>
					</div>
				</section>

				<section className="section">
					<div className="container">
						<Reveal className="sec-head center-head">
							<span className="eyebrow">
								<Icon name="heart" /> ارزش‌های ما
							</span>
							<h2>چیزهایی که براشون کوتاه نمیایم</h2>
						</Reveal>
						<div className="values">
							{VALUES.map((v, i) => (
								<Reveal key={v.title} className="val" delay={i ? i * 0.08 : undefined}>
									<span className="vi">
										<Icon name={v.icon} />
									</span>
									<h3>{v.title}</h3>
									<p>{v.text}</p>
								</Reveal>
							))}
						</div>
					</div>
				</section>

				<section className="section-sm">
					<div className="container">
						<StatCounters />
					</div>
				</section>

				<section className="section">
					<div className="container">
						<Reveal className="sec-head">
							<div>
								<span className="eyebrow">
									<Icon name="cal" /> مسیر ما
								</span>
								<h2>قدم به قدم تا امروز</h2>
							</div>
						</Reveal>
						<div className="tl">
							{TIMELINE.map((t, i) => (
								<Reveal key={t.year} className="tl-i" delay={i ? i * 0.08 : undefined}>
									<span className="dot">
										<Icon name={t.icon} />
									</span>
									<b>{t.year}</b>
									<h4>{t.title}</h4>
									<p>{t.text}</p>
								</Reveal>
							))}
						</div>
					</div>
				</section>

				<section className="section" style={{ paddingTop: 20 }}>
					<div className="container">
						<Reveal className="sec-head">
							<div>
								<span className="eyebrow">
									<Icon name="eye" /> پشت صحنه
								</span>
								<h2>یه کیف چطور به دستت می‌رسه؟</h2>
							</div>
						</Reveal>
						<div className="proc">
							{PROCESS.map((p, i) => (
								<Reveal key={p.n} className="pstep" delay={i ? i * 0.08 : undefined}>
									<span className="n">{p.n}</span>
									<div className="art">
										<BagArt type={p.bag} color={p.color} />
									</div>
									<h3>{p.title}</h3>
									<p>{p.text}</p>
								</Reveal>
							))}
						</div>
					</div>
				</section>

				<section className="section-sm">
					<div className="container">
						<Reveal className="cta">
							<div>
								<h2>آماده‌ای کیف بعدیت رو پیدا کنی؟</h2>
								<p>با خیال راحت خرید کن؛ قبل از ارسال، خودت می‌بینیش.</p>
							</div>
							<div className="btns">
								<Link className="btn btn-white btn-lg" href="/products">
									مشاهده محصولات <Icon name="arrow" />
								</Link>
								<Link className="btn btn-lg btn-ghost-light" href="/contact">
									تماس با ما
								</Link>
							</div>
							<div className="deco">
								<BagArt type="tote" color="lilac" />
							</div>
						</Reveal>
					</div>
				</section>
			</main>
		</div>
	);
}
