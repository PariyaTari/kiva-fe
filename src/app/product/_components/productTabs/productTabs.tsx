"use client";

import Link from "next/link";
import classNames from "classnames";
import { useQuery } from "@tanstack/react-query";
import { Icon } from "@/app/_components/icon/icons";
import { useAuthStore } from "@/store/auth.store";
import { toPersianDigits } from "@/utils/digits";
import { withMappedError } from "@/utils/withMappedError";
import { ProductEndpoints } from "../../_api/productEndpoints";
import { ProductDetail } from "../../_types/product.type";
import Reviews from "../reviews/reviews";

export type ProductTab = "desc" | "spec" | "rev" | "ship";

const TABS: { key: ProductTab; label: string }[] = [
	{ key: "desc", label: "توضیحات" },
	{ key: "spec", label: "مشخصات" },
	{ key: "rev", label: "نظرات" },
	{ key: "ship", label: "ارسال و بازگشت" },
];

const REVIEWS_PAGE_SIZE = 20;

type ProductTabsProps = {
	product: ProductDetail;
	tab: ProductTab;
	onTab: (tab: ProductTab) => void;
};

/** `.pd-tabs` — description, specs, reviews, shipping & returns. */
export default function ProductTabs({ product, tab, onTab }: ProductTabsProps) {
	const hydrated = useAuthStore((s) => s.hydrated);

	// the author's pending reviews come back only with the token → wait for the session
	const reviews = useQuery({
		queryKey: ["product", product.id, "reviews"],
		queryFn: () => withMappedError(() => ProductEndpoints.listReviews(product.id, { page: 1, size: REVIEWS_PAGE_SIZE })),
		enabled: hydrated,
	});

	return (
		<div className="pd-tabs" id="tabsWrap">
			<div className="tabs" role="tablist">
				{TABS.map((t) => (
					<button key={t.key} type="button" className={classNames({ on: tab === t.key })} role="tab" aria-selected={tab === t.key} onClick={() => onTab(t.key)}>
						{t.label}
						{t.key === "rev" && (
							<>
								{" "}
								<span className="cnt" id="rvCnt">
									{reviews.data ? toPersianDigits(reviews.data.meta.totalItems) : ""}
								</span>
							</>
						)}
					</button>
				))}
			</div>

			<div className={classNames("tab-panel", { on: tab === "desc" })} id="t-desc">
				<div className="desc">
					{product.description && <div dangerouslySetInnerHTML={{ __html: product.description }} />}
					{!!product.highlights?.length && (
						<>
							<h4>چرا {product.name}؟</h4>
							<ul>
								{product.highlights.map((h) => (
									<li key={h}>
										<Icon name="check" />
										<span>{h}</span>
									</li>
								))}
							</ul>
						</>
					)}
				</div>
			</div>

			<div className={classNames("tab-panel", { on: tab === "spec" })} id="t-spec">
				<table className="spec">
					<tbody>
						{product.specTable.map((row) => (
							<tr key={row.key}>
								<th>{row.label}</th>
								<td>
									{row.swatches?.length ? (
										row.swatches.map((c) => (
											<span key={c.key} style={{ whiteSpace: "nowrap", marginInlineEnd: 10 }}>
												<span className="swatch-dot" style={{ background: c.hex }} />
												{c.name}
											</span>
										))
									) : row.tone === "DANGER" ? (
										<span className="low-stock">{row.value}</span>
									) : row.tone === "DARK" ? (
										<span className="tag tag-dark">{row.value}</span>
									) : (
										row.value
									)}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			<div className={classNames("tab-panel", { on: tab === "rev" })} id="t-rev">
				<Reviews productId={product.id} slug={product.slug} reviews={reviews} />
			</div>

			<div className={classNames("tab-panel", { on: tab === "ship" })} id="t-ship">
				<ShippingInfo />
			</div>
		</div>
	);
}

const SHIPPING_LINES: { icon: "truck" | "box" | "timer" | "camera"; title: string; text: string }[] = [
	{ icon: "truck", title: "تیپاکس:", text: "تحویل ۱ تا ۲ روز کاری — ۱۴۵٬۰۰۰ تومان" },
	{ icon: "box", title: "پست معمولی:", text: "تحویل ۳ تا ۵ روز کاری — ۷۵٬۰۰۰ تومان (برای خریدهای بالای ۳ میلیون تومان رایگان)" },
	{
		icon: "timer",
		title: "رزرو ۴ روزه:",
		text: "مبلغ رو کامل پرداخت می‌کنی و سفارشت ۴ روز نگه داشته می‌شه تا اگه خرید دیگه‌ای داشتی، همه با یک هزینه ارسال برسه.",
	},
	{
		icon: "camera",
		title: "عکس قبل از ارسال:",
		text: "قبل از بسته‌بندی، از کیف خودت عکس یا ویدیو می‌گیریم و توی پیام‌رسانی که انتخاب کردی می‌فرستیم.",
	},
];

/** «ارسال و بازگشت» — store-wide copy of the design. */
function ShippingInfo() {
	return (
		<div className="desc">
			<h4>روش‌های ارسال</h4>
			<ul>
				{SHIPPING_LINES.map((line) => (
					<li key={line.icon}>
						<Icon name={line.icon} />
						<span>
							<b>{line.title}</b> {line.text}
						</span>
					</li>
				))}
			</ul>
			<h4>بازگشت کالا</h4>
			<p>
				اگه کیفی که رسید با عکس‌ها فرق داشت یا ایراد تولیدی داشت، تا ۷ روز بعد از تحویل می‌تونی بدون هزینه برش گردونی.{" "}
				<Link className="btn-link" href="/faq#return">
					جزئیات بیشتر
				</Link>
			</p>
		</div>
	);
}
