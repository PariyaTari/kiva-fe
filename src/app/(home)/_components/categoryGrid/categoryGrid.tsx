import Link from "next/link";
import Reveal from "@/app/_components/common/reveal/reveal";
import { Icon } from "@/app/_components/icon/icons";
import { CategoryIcon } from "@/app/_components/site/megaMenu/megaMenu";
import { Category } from "@/types/catalog.type";
import { toPersianDigits } from "@/utils/digits";

/** «دنبال چه کیفی هستی؟» — eight illustrated category tiles. */
export default function CategoryGrid({ categories }: { categories: Category[] }) {
	return (
		<section className="section" aria-labelledby="catT">
			<div className="container">
				<Reveal className="sec-head center-head">
					<span className="eyebrow">
						<Icon name="sparkle" /> دسته‌بندی‌ها
					</span>
					<h2 id="catT">دنبال چه کیفی هستی؟</h2>
				</Reveal>
				<div className="cats" id="cats">
					{categories.map((c, i) => (
						<Reveal as={Link} key={c.slug} className="cat" delay={i * 0.05} href={`/products?category=${c.slug}`}>
							<span className="circle">
								<CategoryIcon category={c} />
							</span>
							<span>
								<b>{c.name}</b>
								<small>{toPersianDigits(c.productCount ?? 0)} مدل</small>
							</span>
						</Reveal>
					))}
				</div>
			</div>
		</section>
	);
}
