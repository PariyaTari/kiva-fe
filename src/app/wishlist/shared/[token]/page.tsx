import "../../_styles/wishlist.css";
import type { Metadata } from "next";
import { NO_INDEX } from "@/utils/seo";
import SharedWishlistView from "../../_components/sharedWishlistView/sharedWishlistView";

export const metadata: Metadata = {
	title: "لیست علاقه‌مندی",
	robots: NO_INDEX,
};

/** `/wishlist/shared/{token}` — the public link `POST /me/wishlist/share` hands out (`WishlistShare.url`). */
export default async function SharedWishlistPage({ params }: { params: Promise<{ token: string }> }) {
	const { token } = await params;
	return (
		<div className="pg-wishlist">
			<main>
				<SharedWishlistView token={token} />
			</main>
		</div>
	);
}
