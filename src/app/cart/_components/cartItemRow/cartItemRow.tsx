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

/** `.citem` — quantity stepper (− turns into a bin at 1), move to wishlist, remove with «برگردون». */
export default function CartItemRow({ item }: { item: CartItem }) {
	const queryClient = useQueryClient();
	const signedIn = useAuthStore((s) => !!s.accessToken);
	const promptLogin = useUiStore((s) => s.promptLogin);
	// `.out` plays the slide-away while the request runs
	const [leaving, setLeaving] = useState(false);
	const href = item.product.url ?? `/product/${item.product.slug}?color=${item.color.key}`;

	const refresh = () => queryClient.invalidateQueries({ queryKey: ["cart"] });

	const setQty = useMutation({
		mutationFn: (quantity: number) => withMappedError(() => CartEndpoints.updateItem(item.id, { quantity })),
		meta: { showNotification: true },
		onSuccess: refresh,
	});

	const undo = useMutation({
		mutationFn: (payload: { variantId: number; quantity: number }) => withMappedError(() => CartEndpoints.addItem(payload)),
		meta: { showNotification: true },
		onSuccess: refresh,
	});

	const remove = useMutation({
		mutationFn: () => withMappedError(() => CartEndpoints.removeItem(item.id)),
		meta: { showNotification: true },
		onSuccess: (res) => {
			refresh();
			const back = res.removedItem ?? { variantId: item.variantId, quantity: item.quantity, name: item.product.name };
			toast(`${back.name} حذف شد`, {
				icon: "trash",
				action: { label: "برگردون", onClick: () => undo.mutate({ variantId: back.variantId, quantity: back.quantity }) },
			});
		},
		onError: () => setLeaving(false),
	});

	const moveToWishlist = useMutation({
		mutationFn: () => withMappedError(() => CartEndpoints.moveToWishlist(item.id)),
		meta: { showNotification: true },
		onSuccess: () => {
			refresh();
			queryClient.invalidateQueries({ queryKey: ["wishlist"] });
		},
		onError: () => setLeaving(false),
	});

	const busy = setQty.isPending || remove.isPending || moveToWishlist.isPending;
	const quantity = setQty.isPending ? setQty.variables : item.quantity;
	const max = item.maxQuantity ?? item.stock.maxOrderQuantity ?? item.quantity;

	const step = (delta: 1 | -1) => {
		const next = quantity + delta;
		if (next < 1) return drop();
		if (next > max) {
			toast(`حداکثر موجودی این کالا ${toPersianDigits(max)} عدده`, { icon: "info" });
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
		<div className={classNames("citem", { out: leaving })}>
			<Link className="th" href={href}>
				<MediaImage src={item.image?.url} alt={item.image?.alt ?? item.product.name} />
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
					{item.stock.status === "LOW_STOCK" && item.stock.availableQuantity != null && (
						<span className="low-stock">فقط {toPersianDigits(item.stock.availableQuantity)} عدد باقی مانده</span>
					)}
					{item.stock.status === "OUT_OF_STOCK" && <span className="low-stock">{item.stock.label ?? "ناموجود"}</span>}
				</div>
				<div className="acts">
					<div className="qty">
						<button type="button" aria-label="افزایش" disabled={busy} onClick={() => step(1)}>
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
