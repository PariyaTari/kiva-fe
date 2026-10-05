"use client";

import { useRef } from "react";
import Link from "next/link";
import Reveal from "@/app/_components/common/reveal/reveal";
import { Icon } from "@/app/_components/icon/icons";
import ProductCard from "@/app/_components/shop/productCard/productCard";
import ScrollNav from "@/app/_components/shop/scrollNav/scrollNav";
import { ProductSummary } from "@/types/catalog.type";

/** «محصولات جدید» — horizontal row with prev/next. */
export default function NewArrivals({ products }: { products: ProductSummary[] }) {
	const row = useRef<HTMLDivElement>(null);

	return (
		<section className="section" style={{ paddingTop: 20 }} aria-labelledby="newT">
			<div className="container">
				<Reveal className="sec-head">
					<div>
						<span className="eyebrow">
							<Icon name="sparkle" /> تازه رسیده
						</span>
						<h2 id="newT">محصولات جدید</h2>
						<p>تازه‌ترین کیف‌های کیوا، با عکس و ویدیوی واقعی.</p>
					</div>
					<div style={{ display: "flex", alignItems: "center", gap: 18 }}>
						<Link className="more" href="/products?sort=newest">
							مشاهده همه <Icon name="arrow" />
						</Link>
						<ScrollNav target={row} />
					</div>
				</Reveal>
				<div className="h-scroll" id="newRow" ref={row}>
					{products.map((p, i) => (
						<ProductCard key={p.id} product={p} delay={(i % 4) * 0.07} />
					))}
				</div>
			</div>
		</section>
	);
}
