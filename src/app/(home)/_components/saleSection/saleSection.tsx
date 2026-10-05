import Link from "next/link";
import Reveal from "@/app/_components/common/reveal/reveal";
import { Icon } from "@/app/_components/icon/icons";
import ProductCard from "@/app/_components/shop/productCard/productCard";
import Countdown from "../countdown/countdown";
import { Campaign } from "../../_types/home.type";

/** Active campaign — countdown + the most-discounted in-stock bags. */
export default function SaleSection({ sale }: { sale: Campaign }) {
	return (
		<section className="section" id="sale" aria-labelledby="saleT">
			<div className="container">
				<Reveal className="sale-wrap">
					<div className="sec-head">
						<div>
							<span className="eyebrow">
								<Icon name={sale.icon} /> {sale.title}
							</span>
							<h2 id="saleT">محصولات تخفیف‌خورده</h2>
							<p>{sale.subtitle}</p>
						</div>
						<Countdown endsAt={sale.endsAt} serverTime={sale.serverTime} />
					</div>
					<div className="p-grid" id="saleGrid">
						{sale.products.map((p, i) => (
							<ProductCard key={p.id} product={p} delay={i * 0.07} />
						))}
					</div>
					<div style={{ textAlign: "center", marginTop: 34 }}>
						<Link className="btn btn-outline" href={sale.seeAllUrl}>
							همه تخفیف‌ها <Icon name="arrow" />
						</Link>
					</div>
				</Reveal>
			</div>
		</section>
	);
}
