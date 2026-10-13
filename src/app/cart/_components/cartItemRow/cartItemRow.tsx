"use client";

import { useState } from "react";
import Link from "next/link";
import classNames from "classnames";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Icon } from "@/app/_components/icon/icons";
import MediaImage from "@/app/_components/shop/mediaImage/mediaImage";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "@/store/notification.store";
import { useUiStore } from "@/store/ui.store";
import { CartItem } from "@/types/cart.type";
import { toPersianDigits } from "@/utils/digits";
import { formatPrice } from "@/utils/format";
import { withMappedError } from "@/utils/withMappedError";
import { CartEndpoints } from "../../_api/cartEndpoints";
import { isCartChangedError } from "../../_utils/apiError";
import { announceCartIssues } from "../../_utils/cartIssues";

type CartItemRowProps = {
	item: CartItem;
	/** How many of the same product's other colours are in the cart — the purchase cap is the product's, shared by its colours. */
	otherColours: number;
};

/** `.citem` — quantity stepper (− turns into a bin at 1), move to wishlist, remove with «برگردون». */
export default function CartItemRow({ item, otherColours }: CartItemRowProps) {
	const queryClient = useQueryClient();
	const signedIn = useAuthStore((s) => !!s.accessToken);
	const promptLogin = useUiStore((s) => s.promptLogin);
	// `.out` plays the slide-away while the request runs
	const [leaving, setLeaving] = useState(false);
	const href = item.product.url ?? `/product/${item.product.slug}?color=${item.color.key}`;
	/** Sold out / left the store — stays to see or remove, outside the totals. */
	const off = item.purchasable === false;

	const refresh = () => queryClient.invalidateQueries({ queryKey: ["cart"] });

	const setQty = useMutation({
		mutationFn: (quantity: number) => withMappedError(() => CartEndpoints.updateItem(item.id, { quantity })),
		meta: { showNotification: true },
		onSuccess: (res) => {
			announceCartIssues(res.cart);
			refresh();
		},
		// the toast says why; the row's caps changed (or it is gone) — show the cart as it is now
		onError: (e) => isCartChangedError(e) && refresh(),
	});

	const undo = useMutation({
		mutationFn: (payload: { variantId: number; quantity: number }) => withMappedError(() => CartEndpoints.addItem(payload)),
		meta: { showNotification: true },
		onSuccess: (res) => {
			announceCartIssues(res.cart);
			refresh();
		},
	});

	const remove = useMutation({
		mutationFn: () => withMappedError(() => CartEndpoints.removeItem(item.id)),
		meta: { showNotification: true },
		onSuccess: (res) => {
			announceCartIssues(res.cart);
			refresh();
			const back = res.removedItem ?? { variantId: item.variantId, quantity: item.quantity, name: item.product.name };
			toast(`${back.name} حذف شد`, {
				icon: "trash",
				// a row that can't be bought can't come back either
				action: off ? undefined : { label: "برگردون", onClick: () => undo.mutate({ variantId: back.variantId, quantity: back.quantity }) },
			});
		},
		onError: (e) => {
			setLeaving(false);
			if (isCartChangedError(e)) refresh();
		},
	});

	const moveToWishlist = useMutation({
		mutationFn: () => withMappedError(() => CartEndpoints.moveToWishlist(item.id)),
		meta: { showNotification: true },
		onSuccess: (res) => {
			announceCartIssues(res.cart);
			refresh();
			queryClient.invalidateQueries({ queryKey: ["wishlist"] });
		},
		onError: (e) => {
			setLeaving(false);
			if (isCartChangedError(e)) refresh();
		},
	});

	const busy = setQty.isPending || remove.isPending || moveToWishlist.isPending;
	const quantity = setQty.isPending ? setQty.variables : item.quantity;
	const max = item.maxQuantity ?? item.stock.maxOrderQuantity ?? item.quantity;

	const capText = () => {
		// the product's cap is shared by its colours (contract 1.7.0)
		if (otherColours > 0) return `از این کیف با رنگ‌های دیگه‌ش حداکثر ${toPersianDigits(max + otherColours)} عدد می‌تونی بخری`;
		const left = item.stock.availableQuantity;
		return left != null && left <= max ? `حداکثر موجودی این کالا ${toPersianDigits(left)} عدده` : `حداکثر ${toPersianDigits(max)} عدد در هر سفارش`;
	};

	const step = (delta: 1 | -1) => {
		const next = quantity + delta;
		if (next < 1) return drop();
		if (next > max) {
			toast(capText(), { icon: "info" });
			return;
		}
		setQty.mutate(next);
	};

	const drop = () => {
		setLeaving(true);
		remove.mutate();
	};

	const save = () => {
		if (!signedIn) {
			promptLogin("برای انتقال به علاقه‌مندی‌ها اول وارد شو.");
			return;
		}
		setLeaving(true);
		moveToWishlist.mutate();
	};

	return (
		<div className={classNames("citem", { out: leaving, off })} data-item={item.id}>
			<Link className="th" href={href}>
				<MediaImage src={item.image?.url} alt={item.image?.alt ?? item.product.name} placeholderColor={item.color.hex} />
			</Link>
			<div>
				<h4>
					<Link href={href}>{item.product.name}</Link>
				</h4>
				<div className="meta">
					<span>
						<span className="swatch-dot" style={{ background: item.color.hex }} />
						{item.color.name}
					</span>
					{item.product.category && <span>{item.product.category.name}</span>}
					{off ? (
						<span className="low-stock">{item.stock.status === "OUT_OF_STOCK" ? "این رنگ تموم شده" : "این کیف دیگه فروخته نمی‌شه"}</span>
					) : (
						item.stock.status === "LOW_STOCK" &&
						item.stock.availableQuantity != null && <span className="low-stock">فقط {toPersianDigits(item.stock.availableQuantity)} عدد باقی مانده</span>
					)}
				</div>
				<div className="acts">
					<div className="qty">
						<button type="button" aria-label="افزایش" disabled={busy || off} onClick={() => step(1)}>
							<Icon name="plus" />
						</button>
						<span>{toPersianDigits(quantity)}</span>
						<button type="button" aria-label="کاهش" disabled={busy} onClick={() => step(-1)}>
							<Icon name={quantity > 1 ? "minus" : "trash"} />
						</button>
					</div>
					<button type="button" className="lnk w" disabled={busy} onClick={save}>
						<Icon name="heart" /> انتقال به علاقه‌مندی
					</button>
					<button type="button" className="lnk" disabled={busy} onClick={drop}>
						<Icon name="trash" /> حذف
					</button>
				</div>
			</div>
			<div className="pr">
				{item.lineCompareAtTotal ? <del>{formatPrice(item.lineCompareAtTotal)}</del> : null}
				<b>{formatPrice(item.lineTotal)}</b> <small>تومان</small>
			</div>
		</div>
	);
}
