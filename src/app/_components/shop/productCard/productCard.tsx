"use client";

import { CSSProperties, useRef, useState } from "react";
import Link from "next/link";
import classNames from "classnames";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Icon } from "@/app/_components/icon/icons";
import { toneClass } from "@/app/_components/ui/badge/badge";
import MediaImage from "@/app/_components/shop/mediaImage/mediaImage";
import WishlistToggle from "@/app/_components/shop/wishlistToggle/wishlistToggle";
import { CartEndpoints } from "@/app/cart/_api/cartEndpoints";
import { useReveal } from "@/hooks/useReveal";
import { toast } from "@/store/notification.store";
import { useUiStore } from "@/store/ui.store";
import { toPersianDigits } from "@/utils/digits";
import { flyToCart } from "@/utils/flyToCart";
import { formatPrice } from "@/utils/format";
import { withMappedError } from "@/utils/withMappedError";
import { ProductCardProps } from "./productCard.type";

const MAX_DOTS = 5;

/** Product card of the design system (`K.card`): colour dots swap the image, quick add, wishlist heart. */
export default function ProductCard({ product, colorKey, delay = 0, reveal = true }: ProductCardProps) {
	const queryClient = useQueryClient();
	const openCart = useUiStore((s) => s.open);
	const [revealRef, shown] = useReveal<HTMLElement>();
	const imgRef = useRef<HTMLDivElement>(null);

	const initial = product.colors.find((c) => c.color.key === (colorKey ?? product.displayColorKey)) ?? product.colors[0];
	const [color, setColor] = useState(initial?.color.key ?? product.defaultColorKey);
	// bumping replays the `.swap` animation on colour change
	const [swapKey, setSwapKey] = useState(0);
	const option = product.colors.find((c) => c.color.key === color) ?? initial;

	const soldOut = product.stock.status === "OUT_OF_STOCK";
	const lowStock = product.stock.status === "LOW_STOCK" && product.stock.availableQuantity;
	const off = product.price.discountPercent ?? 0;
	const tags = product.badges.filter((b) => b.code === "NEW" || b.code === "HAS_VIDEO");
	const href = `/product/${product.slug}?color=${color}`;
	const imageUrl = option?.imageUrl ?? product.image.url;

	const add = useMutation({
		mutationFn: () => withMappedError(() => CartEndpoints.addItem({ variantId: option.variantId, quantity: 1 })),
		meta: { showNotification: true },
		onSuccess: () => {
			flyToCart(imgRef.current);
			queryClient.invalidateQueries({ queryKey: ["cart"] });
			toast(`${product.name} (${option.color.name}) به سبد اضافه شد`, {
				icon: "bag",
				action: { label: "مشاهده سبد", onClick: () => openCart("cart") },
			});
		},
	});

	const pickColor = (key: string) => {
		setColor(key);
		setSwapKey((k) => k + 1);
	};

	return (
		<article
			ref={reveal ? revealRef : undefined}
			className={classNames("pcard", { "is-soldout": soldOut, reveal, in: reveal && shown })}
			style={{ "--d": `${delay}s` } as CSSProperties}
		>
			<div className="pcard-top">
				<Link className="pcard-media" href={href} aria-label={product.name}>
					<div key={swapKey} ref={imgRef} className={classNames("pcard-img", { swap: swapKey > 0 })}>
						<MediaImage src={imageUrl} alt={product.image.alt ?? product.name} />
					</div>
					<div className="pcard-tags">
						{tags.map((tag) => (
							<span key={tag.code} className={classNames("tag", toneClass(tag.tone))}>
								{tag.icon && <Icon name={tag.icon} />}
								{tag.label}
							</span>
						))}
					</div>
					{!!off && !soldOut && (
						<div className="pcard-off">
							<span className="tag tag-sale">{toPersianDigits(off)}٪ تخفیف</span>
						</div>
					)}
					{soldOut && (
						<div className="soldout-ribbon">
							<span>تمام شد</span>
						</div>
					)}
				</Link>
				<WishlistToggle productId={product.id} colorKey={color} className="pcard-wish" />
				{!soldOut && (
					<button type="button" className="pcard-add" onClick={() => add.mutate()} disabled={add.isPending} aria-label={`افزودن ${product.name} به سبد`}>
						<Icon name="plus" />
						<span>افزودن به سبد</span>
					</button>
				)}
			</div>
			<div className="pcard-body">
				<div className="pcard-colors">
					{product.colors.slice(0, MAX_DOTS).map((c) => (
						<button
							key={c.color.key}
							type="button"
							className={classNames("cdot", { on: c.color.key === color })}
							style={{ background: c.color.hex }}
							title={c.color.name}
							aria-label={`رنگ ${c.color.name}`}
							onClick={() => pickColor(c.color.key)}
						/>
					))}
					{product.colors.length > MAX_DOTS && <span className="cmore">+{toPersianDigits(product.colors.length - MAX_DOTS)}</span>}
				</div>
				<h3>
					<Link href={href}>{product.name}</Link>
				</h3>
				<div className="pcard-cat">
					{product.category.name}
					{lowStock ? (
						<>
							{" · "}
							<span className="low-stock">فقط {toPersianDigits(lowStock)} عدد</span>
						</>
					) : null}
				</div>
				<div className="price">
					{product.price.compareAtPrice ? <del>{formatPrice(product.price.compareAtPrice)}</del> : null}
					<strong>{formatPrice(product.price.price)}</strong>
					<small>تومان</small>
				</div>
			</div>
		</article>
	);
}
