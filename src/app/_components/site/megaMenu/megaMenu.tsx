"use client";

import { CSSProperties, useState } from "react";
import Link from "next/link";
import classNames from "classnames";
import { UseQueryResult } from "@tanstack/react-query";
import ErrorComponent from "@/app/_components/common/errorComponent2/errorComponent2";
import { Icon } from "@/app/_components/icon/icons";
import BagArt from "@/app/_components/shop/bagArt/bagArt";
import MediaImage from "@/app/_components/shop/mediaImage/mediaImage";
import { Category } from "@/types/catalog.type";
import { ResultError } from "@/types/result";
import { toErrorView } from "@/utils/apiError";
import { toPersianDigits } from "@/utils/digits";
import { ERROR_BEHAVIOUR } from "../_utils/apiError";

/** Illustration of a category — the uploaded icon if any, otherwise the design's bag drawing. */
export function CategoryIcon({ category }: { category: Category }) {
	if (category.icon?.imageUrl) return <MediaImage src={category.icon.imageUrl} alt={category.name} />;
	return <BagArt type={category.icon?.bagType ?? "TOTE"} color={category.icon?.colorKey ?? "lilac"} />;
}

type MegaMenuProps = {
	categories: UseQueryResult<Category[], ResultError>;
};

/** `.kv-mega` of «فروشگاه» — category list + a stage previewing the hovered category. */
export default function MegaMenu({ categories }: MegaMenuProps) {
	const [current, setCurrent] = useState(0);
	const list = categories.data ?? [];
	const active = list[current];

	const categoriesError = toErrorView(ERROR_BEHAVIOUR, categories.error, "دریافت دسته‌بندی‌ها با خطا مواجه شد.");

	return (
		<div className="kv-mega" aria-label="دسته‌بندی‌های فروشگاه">
			<div className="mg-list">
				{categoriesError ? (
					<div style={{ gridColumn: "1/-1" }}>
						<ErrorComponent
							retryable={categoriesError.retryable}
							ticketAble={categoriesError.ticketAble}
							errorText={categoriesError.errorText}
							executeFunction={() => categories.refetch()}
							height={56}
							loading={categories.isFetching}
						/>
					</div>
				) : (
					list.map((c, i) => (
						<Link
							key={c.slug}
							href={`/products?category=${c.slug}`}
							className={classNames({ on: i === current })}
							style={{ "--i": i } as CSSProperties}
							onMouseEnter={() => setCurrent(i)}
							onFocus={() => setCurrent(i)}
						>
							<span className="mg-ic">
								<CategoryIcon category={c} />
							</span>
							<span>
								<b>{c.name}</b>
								<small>{toPersianDigits(c.productCount ?? 0)} مدل</small>
							</span>
						</Link>
					))
				)}
				<Link className="mg-all" href="/products" style={{ "--i": 8 } as CSSProperties}>
					مشاهده همه محصولات <Icon name="arrow" />
				</Link>
			</div>
			<Link className="mg-stage" href={active ? `/products?category=${active.slug}` : "/products"}>
				{list.map((c, i) => (
					<div key={c.slug} className={classNames("fr", { out: i !== current })}>
						{c.imageUrl ? <MediaImage src={c.imageUrl} alt={c.name} /> : <CategoryIcon category={c} />}
					</div>
				))}
				<span className="mg-cap">
					<span>
						<b>{active?.name}</b>
						<small>{active ? `${toPersianDigits(active.productCount ?? 0)} مدل · مشاهده همه` : ""}</small>
					</span>
					<span className="go">
						<Icon name="arrow" />
					</span>
				</span>
			</Link>
		</div>
	);
}
