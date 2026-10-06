import Link from "next/link";
import classNames from "classnames";
import { Icon } from "@/app/_components/icon/icons";

/** Where the shopper is: filling the form, back from an unpaid bank visit, or done. */
export type CheckoutStage = "shipping" | "payment" | "paid";

/** `.page-hero` of checkout — crumbs, title and the three `.co-steps` (design marks ۲ and ۳ `done` once paid). */
export default function CheckoutHero({ stage = "shipping" }: { stage?: CheckoutStage }) {
	return (
		<section className="page-hero">
			<div className="container">
				<nav className="crumbs" aria-label="مسیر">
					<Link href="/">خانه</Link>
					<Icon name="left" />
					<Link href="/cart">سبد خرید</Link>
					<Icon name="left" />
					<span>تکمیل خرید</span>
				</nav>
				<h1>اطلاعات ارسال و پرداخت</h1>
				<div className="co-steps">
					<Link className="co-step done" href="/cart">
						<i className="ci">
							<Icon name="check" />
						</i>
						سبد خرید
					</Link>
					<span className="co-sep" />
					<span className={classNames("co-step", stage === "shipping" ? "on" : "done")}>
						<i>۲</i>اطلاعات ارسال
					</span>
					<span className="co-sep" />
					<span className={classNames("co-step", { on: stage === "payment", done: stage === "paid" })}>
						<i>۳</i>پرداخت
					</span>
				</div>
			</div>
		</section>
	);
}
