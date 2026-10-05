"use client";

import { MouseEvent, RefObject } from "react";
import Link from "next/link";
import classNames from "classnames";
import { Icon } from "@/app/_components/icon/icons";
import { MessengerIcon } from "@/app/_components/icon/messengerIcon";
import Stars from "@/app/_components/shop/stars/stars";
import WishlistToggle from "@/app/_components/shop/wishlistToggle/wishlistToggle";
import { toPersianDigits } from "@/utils/digits";
import { formatPrice } from "@/utils/format";
import { ProductDetail, ProductVariant } from "../../_types/product.type";

type ProductInfoProps = {
	product: ProductDetail;
	variant: ProductVariant;
	qty: number;
	/** `.buy` row — the mobile sticky bar shows up once it scrolls away. */
	buyRef: RefObject<HTMLDivElement | null>;
	adding: boolean;
	/** «به سبد اضافه شد» flash after a successful add. */
	added: boolean;
	notifying: boolean;
	onColor: (variant: ProductVariant) => void;
	onQty: (delta: 1 | -1) => void;
	onAdd: () => void;
	onNotify: () => void;
	onAsk: () => void;
	onReviews: () => void;
};

/** `.info` column of the product page. */
export default function ProductInfo({
	product,
	variant,
	qty,
	buyRef,
	adding,
	added,
	notifying,
	onColor,
	onQty,
	onAdd,
	onNotify,
	onAsk,
	onReviews,
}: ProductInfoProps) {
	const { price, stock } = variant;
	const soldOut = stock.status === "OUT_OF_STOCK";
	const off = price.discountPercent ?? 0;
	const rating = product.ratingSummary;

	const goReviews = (e: MouseEvent<HTMLAnchorElement>) => {
		e.preventDefault();
		onReviews();
	};

	return (
		<div className="info" id="info">
			<Link className="tag cat-link" href={`/products?category=${product.category.slug}`}>
				{product.category.name}
			</Link>
			<h1>{product.name}</h1>
			<div className="meta-row">
				<span className="stars">
					<Stars value={rating.average} />
				</span>
				<a href="#tabsWrap" onClick={goReviews}>
					{toPersianDigits(rating.average.toFixed(1))} از {toPersianDigits(rating.count)} نظر
				</a>
				<span>کد محصول: {toPersianDigits(product.sku)}</span>
				{product.soldCount != null && <span>{toPersianDigits(product.soldCount)} فروش موفق</span>}
			</div>

			<div className="pbox">
				<div className="pr">
					{price.compareAtPrice ? (
						<>
							<del>{formatPrice(price.compareAtPrice)}</del>{" "}
							<span className="tag tag-sale" style={{ verticalAlign: "middle" }}>
								{toPersianDigits(off)}٪
							</span>
							<br />
						</>
					) : null}
					<strong>{formatPrice(price.price)}</strong> <small>تومان</small>
				</div>
				<span className={classNames("stock", soldOut ? "out" : stock.status === "LOW_STOCK" ? "low" : "ok")}>{stock.label}</span>
			</div>

			<div className="opt-lbl">
				رنگ: <span id="colName">{variant.color.name}</span>
			</div>
			<div className="swatches" role="radiogroup" aria-label="انتخاب رنگ">
				{product.variants.map((v) => {
					const on = v.id === variant.id;
					return (
						<button
							key={v.id}
							type="button"
							className={classNames("sw", { on })}
							style={{ background: v.color.hex }}
							role="radio"
							aria-checked={on}
							aria-label={v.color.name}
							title={v.color.name}
							onClick={() => onColor(v)}
						>
							<span className="ck" style={{ color: v.color.isLight ? "#2A1F3D" : "#fff" }}>
								<Icon name="check" />
							</span>
						</button>
					);
				})}
			</div>

			{soldOut ? (
				<div className="buy" ref={buyRef}>
					<button type="button" className="btn btn-dark btn-lg" style={{ flex: 1 }} id="notify" disabled={notifying} onClick={onNotify}>
						<Icon name="bell" /> موجود شد خبرم کن
					</button>
					<WishlistToggle productId={product.id} colorKey={variant.color.key} className="wish-big" ariaLabel="علاقه‌مندی" />
				</div>
			) : (
				<div className="buy" ref={buyRef}>
					<div className="qty">
						<button type="button" id="qPlus" aria-label="افزایش" onClick={() => onQty(1)}>
							<Icon name="plus" />
						</button>
						<input id="qIn" value={toPersianDigits(qty)} readOnly aria-label="تعداد" />
						<button type="button" id="qMinus" aria-label="کاهش" onClick={() => onQty(-1)}>
							<Icon name="minus" />
						</button>
					</div>
					<button
						type="button"
						className="btn btn-primary"
						id="addBtn"
						disabled={adding}
						style={added ? { background: "var(--success)" } : undefined}
						onClick={onAdd}
					>
						{added ? (
							<>
								<Icon name="check" /> به سبد اضافه شد
							</>
						) : (
							<>
								<Icon name="bag" /> افزودن به سبد خرید
							</>
						)}
					</button>
					<WishlistToggle productId={product.id} colorKey={variant.color.key} className="wish-big" />
				</div>
			)}

			<button type="button" className="ask" id="askBtn" onClick={onAsk}>
				<span className="t">
					<Icon name="chat" /> سؤال داری؟ عکس یا ویدیوی بیشتر بخواه
				</span>
				<span className="icons">
					<MessengerIcon channel="RUBIKA" />
					<MessengerIcon channel="TELEGRAM" />
					<MessengerIcon channel="BALE" />
				</span>
			</button>

			{product.policies?.preShipmentPhoto !== false && (
				<div className="box-cream sig">
					<span className="ic">
						<Icon name="camera" />
					</span>
					<div>
						<b>قبل از ارسال، عکس همین کیف رو می‌بینی</b>
						<p>بعد از ثبت سفارش، از کیفی که برات کنار می‌ذاریم عکس و ویدیو می‌گیریم و توی پیام‌رسانت می‌فرستیم.</p>
					</div>
				</div>
			)}

			{!!product.perks?.length && (
				<div className="perks">
					{product.perks.map((perk) => (
						<div key={perk.title} className="perk">
							<Icon name={perk.icon} />
							<b>{perk.title}</b>
							{perk.subtitle}
						</div>
					))}
				</div>
			)}
		</div>
	);
}
