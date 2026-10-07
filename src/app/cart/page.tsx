import "./_styles/cart.css";
import Link from "next/link";
import type { Metadata } from "next";
import { Icon } from "@/app/_components/icon/icons";
import { NO_INDEX } from "@/utils/seo";
import CartView from "./_components/cartView/cartView";

export const metadata: Metadata = {
	title: "سبد خرید",
	robots: NO_INDEX,
};

/** Cart — design `cart.html`. */
export default function CartPage() {
	return (
		<div className="pg-cart">
			<main>
				<section className="page-hero">
					<div className="container">
						<nav className="crumbs" aria-label="مسیر">
							<Link href="/">خانه</Link>
							<Icon name="left" />
							<span>سبد خرید</span>
						</nav>
						<h1>سبد خرید</h1>
						<div className="co-steps">
							<span className="co-step on">
								<i>۱</i>سبد خرید
							</span>
							<span className="co-sep" />
							<span className="co-step">
								<i>۲</i>اطلاعات ارسال
							</span>
							<span className="co-sep" />
							<span className="co-step">
								<i>۳</i>پرداخت
							</span>
						</div>
					</div>
				</section>

				<CartView />
			</main>
		</div>
	);
}
