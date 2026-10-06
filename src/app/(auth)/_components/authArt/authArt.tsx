import { Icon } from "@/app/_components/icon/icons";
import Reveal from "@/app/_components/common/reveal/reveal";

const BENEFITS = [
	{ icon: "camera", title: "عکس‌های قبل از ارسال", text: "همه‌ی عکس‌ها و ویدیوهای کیفت توی حسابت می‌مونه" },
	{ icon: "box", title: "پیگیری لحظه‌ای سفارش", text: "از ثبت تا تحویل، با کد رهگیری" },
	{ icon: "heart", title: "لیست علاقه‌مندی‌ها", text: "کیف‌هایی که دوست داری رو ذخیره کن" },
];

/** `.auth-art` — the pitch beside the login card (benefits hide on small screens). */
export default function AuthArt() {
	return (
		<div className="auth-art">
			<h2>
				یه قدم تا
				<br />
				<em>کیف دلخواهت</em>
			</h2>
			<p>بدون رمز عبور و بدون فرم طولانی؛ فقط شماره موبایلت رو بزن و با کد یک‌بارمصرف وارد شو.</p>
			<div className="benefits">
				{BENEFITS.map((b, i) => (
					<Reveal key={b.title} className="benefit" delay={i ? i * 0.08 : undefined}>
						<span className="bi">
							<Icon name={b.icon} />
						</span>
						<div>
							<b>{b.title}</b>
							<span>{b.text}</span>
						</div>
					</Reveal>
				))}
			</div>
		</div>
	);
}
