import "./_styles/products.css";
import { Suspense } from "react";
import type { Metadata } from "next";
import ProductsView from "./_components/productsView/productsView";

export const metadata: Metadata = {
	title: "فروشگاه",
};

/** Shop — design `products.html`. */
export default function ProductsPage() {
	return (
		<div className="pg-products">
			<main>
				{/* filters are read from the URL — useSearchParams needs a boundary */}
				<Suspense>
					<ProductsView />
				</Suspense>
			</main>
		</div>
	);
}
