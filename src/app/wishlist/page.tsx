import "./_styles/wishlist.css";
import Link from "next/link";
import type { Metadata } from "next";
import { Icon } from "@/app/_components/icon/icons";
import BagArt from "@/app/_components/shop/bagArt/bagArt";
import WishlistView from "./_components/wishlistView/wishlistView";

export const metadata: Metadata = {
	title: "علاقه‌مندی‌ها",
};

/** Wishlist — design `wishlist.html`. */
export default function WishlistPage() {
	return (
		<div className="pg-wishlist">
			<main>
				<section className="page-hero">
					<div className="container hero-row">
						<div>
							<nav className="crumbs" aria-label="مسیر">
								<Link href="/">خانه</Link>
								<Icon name="left" />
								<span>علاقه‌مندی‌ها</span>
							</nav>
							<h1>علاقه‌مندی‌های من</h1>
							<p>کیف‌هایی که دلت رو برده؛ هر وقت آماده بودی، با یه کلیک به سبد اضافه‌شون کن.</p>
						</div>
						<div className="art float">
							<BagArt type="hobo" color="lilac" variant={2} />
						</div>
					</div>
				</section>
				<div className="container" id="root">
					<WishlistView />
				</div>
			</main>
		</div>
	);
}
