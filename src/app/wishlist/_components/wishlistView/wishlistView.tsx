"use client";

import { useState } from "react";
import Link from "next/link";
import classNames from "classnames";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import ErrorComponent from "@/app/_components/common/errorComponent2/errorComponent2";
import Loading from "@/app/_components/common/loading/loading";
// BACKEND-PENDING(wishlist-share): only the share box used it
// import Reveal from "@/app/_components/common/reveal/reveal";
import { Icon } from "@/app/_components/icon/icons";
import BagArt from "@/app/_components/shop/bagArt/bagArt";
import ProductCard from "@/app/_components/shop/productCard/productCard";
import { announceCartIssues } from "@/app/cart/_utils/cartIssues";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "@/store/notification.store";
import { toErrorView } from "@/utils/apiError";
// BACKEND-PENDING(wishlist-share)
// import { copyText } from "@/utils/clipboard";
import { toPersianDigits } from "@/utils/digits";
import { withMappedError } from "@/utils/withMappedError";
import { WishlistEndpoints } from "../../_api/wishlistEndpoints";
import { ERROR_BEHAVIOUR /* BACKEND-PENDING(wishlist-share): , isShareDisabledError */ } from "../../_utils/apiError";

/** Length of the design's `.wcard.out` shrink before the card is really removed. */
const LEAVE_MS = 420;

/** `#root` of `wishlist.html` — login gate, empty gate, or the saved bags with bulk actions and sharing. */
export default function WishlistView() {
	const queryClient = useQueryClient();
	const hydrated = useAuthStore((s) => s.hydrated);
	const signedIn = useAuthStore((s) => !!s.accessToken);
	const [leaving, setLeaving] = useState<number[]>([]);
	// BACKEND-PENDING(wishlist-share): sharing the list (`POST/DELETE /me/wishlist/share`) is still [پیشنهادی] in the contract (1.22.0) — off until the backend builds it; uncomment to bring it back
	// /** Sharing is switched off on the server (`WISHLIST_SHARE_DISABLED`) — the box goes away. */
	// const [shareOff, setShareOff] = useState(false);

	// shared with the account's wishlist panel; hearts and removals invalidate ["wishlist"]
	const wishlist = useQuery({
		queryKey: ["wishlist", "list", { page: 1, size: 48 }],
		queryFn: () => withMappedError(() => WishlistEndpoints.getWishlist(1, 48)),
		enabled: hydrated && signedIn,
		meta: { showNotificationOnRefetch: true },
	});

	const remove = useMutation({
		mutationFn: (productId: number) => withMappedError(() => WishlistEndpoints.remove(productId)),
		meta: { showNotification: true },
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["wishlist"] }),
		onSettled: (_res, _err, productId) => setLeaving((ids) => ids.filter((id) => id !== productId)),
	});

	const addAll = useMutation({
		mutationFn: () => withMappedError(() => WishlistEndpoints.addAllToCart()),
		meta: { showNotification: true },
		onSuccess: (res) => {
			announceCartIssues(res.cart);
			queryClient.invalidateQueries({ queryKey: ["cart"] });
			toast(res.message || `${toPersianDigits(res.addedCount)} کیف به سبد اضافه شد`, { icon: "bag", action: { label: "مشاهده سبد", href: "/cart" } });
		},
	});

	const clear = useMutation({
		mutationFn: () => withMappedError(() => WishlistEndpoints.clear()),
		meta: { showNotification: true },
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["wishlist"] });
			toast("لیست علاقه‌مندی‌ها پاک شد", { icon: "trash" });
		},
	});

	// BACKEND-PENDING(wishlist-share)
	// // «لغو لینک» (not in the design): the old link answers 404 at once; «کپی لینک لیست» makes a new one
	// const revoke = useMutation({
	// 	mutationFn: () => withMappedError(() => WishlistEndpoints.revokeShare()),
	// 	meta: { showNotification: true },
	// 	onSuccess: () => {
	// 		queryClient.invalidateQueries({ queryKey: ["wishlist"] });
	// 		toast("لینک قبلی لیستت دیگه باز نمی‌شه؛ هر وقت خواستی لینک تازه بساز", { icon: "share" });
	// 	},
	// });

	// const share = useMutation({
	// 	mutationFn: () => withMappedError(() => WishlistEndpoints.share()),
	// 	onSuccess: (res) => {
	// 		copyText(res.url, "لینک لیست کپی شد");
	// 		// the box now knows the link is live (its «لغو لینک»)
	// 		queryClient.invalidateQueries({ queryKey: ["wishlist", "list"] });
	// 	},
	// 	onError: (e) => {
	// 		if (isShareDisabledError(e)) setShareOff(true);
	// 		toast(e.description, { type: isShareDisabledError(e) ? "info" : "error", icon: isShareDisabledError(e) ? "info" : undefined });
	// 	},
	// });

	const drop = (productId: number) => {
		setLeaving((ids) => [...ids, productId]);
		setTimeout(() => remove.mutate(productId), LEAVE_MS);
	};

	if (!hydrated || (signedIn && wishlist.isLoading)) return <Loading />;

	if (!signedIn)
		return (
			<div className="gate">
				<div className="art">
					<BagArt type="cross" color="pink" variant={2} />
				</div>
				<h2>اول وارد شو</h2>
				<p>برای ذخیره و دیدن علاقه‌مندی‌ها، با شماره موبایلت وارد شو. بدون رمز، فقط با کد یک‌بارمصرف.</p>
				<Link className="btn btn-primary btn-lg" href={`/login?next=${encodeURIComponent("/wishlist")}`}>
					<Icon name="phone" /> ورود با موبایل
				</Link>
			</div>
		);

	const wishlistError = toErrorView(ERROR_BEHAVIOUR, wishlist.error, "دریافت علاقه‌مندی‌ها با خطا مواجه شد.");
	if (wishlistError)
		return (
			<div style={{ paddingTop: 36 }}>
				<ErrorComponent
					retryable={wishlistError.retryable}
					ticketAble={wishlistError.ticketAble}
					errorText={wishlistError.errorText}
					executeFunction={() => wishlist.refetch()}
					loading={wishlist.isFetching}
				/>
			</div>
		);

	const data = wishlist.data;
	if (!data) return null;

	if (!data.items.length)
		return (
			<div className="gate">
				<div className="art">
					<BagArt type="tote" color="lilac" variant={2} />
				</div>
				<h2>هنوز چیزی ذخیره نکردی</h2>
				<p>روی آیکن ♡ هر کیفی بزنی، این‌جا برات نگه می‌داریم. حتی اگه تموم بشه، وقتی موجود شد خبرت می‌کنیم.</p>
				<Link className="btn btn-primary btn-lg" href="/products">
					گشتن توی فروشگاه <Icon name="arrow" />
				</Link>
			</div>
		);

	return (
		<>
			<div className="w-bar">
				<span className="cnt">
					<b>{toPersianDigits(data.count ?? data.items.length)}</b> کیف ذخیره‌شده
				</span>
				<div className="acts">
					{data.inStockCount > 0 && (
						<button type="button" className={classNames("btn btn-primary btn-sm", { loading: addAll.isPending })} id="addAll" onClick={() => addAll.mutate()}>
							<Icon name="bag" /> افزودن همه موجودها به سبد ({toPersianDigits(data.inStockCount)})
						</button>
					)}
					<button type="button" className={classNames("btn btn-outline btn-sm", { loading: clear.isPending })} id="clearAll" onClick={() => clear.mutate()}>
						<Icon name="trash" /> پاک کردن لیست
					</button>
				</div>
			</div>
			<div className="p-grid">
				{data.items.map((item, i) => (
					<div key={item.product.id} className={classNames("wcard", { out: leaving.includes(item.product.id) })} data-w={item.product.id}>
						<button type="button" className="rm" aria-label="حذف از علاقه‌مندی‌ها" onClick={() => drop(item.product.id)}>
							<Icon name="close" />
						</button>
						<ProductCard product={item.product} colorKey={item.preferredColorKey} delay={(i % 4) * 0.06} />
						{item.priceDrop && (
							<span className="price-drop">
								<Icon name="tag" /> {item.priceDrop.label}
							</span>
						)}
					</div>
				))}
			</div>
			{/* BACKEND-PENDING(wishlist-share):
			{!shareOff && (
				<Reveal className="box-cream share-box">
					<span className="ic">
						<Icon name="share" />
					</span>
					<div>
						<b>لیستت رو با دوستات به اشتراک بذار</b>
						<p>{wishlist.data?.share ? "لینک لیستت فعاله؛ هر کسی لینک رو داشته باشه، لیستت رو می‌بینه." : "شاید یکی خواست برات هدیه بخره"}</p>
					</div>
					<div className="share-acts">
						{wishlist.data?.share && (
							<button type="button" className={classNames("btn btn-outline btn-sm", { loading: revoke.isPending })} onClick={() => revoke.mutate()}>
								لغو لینک
							</button>
						)}
						<button type="button" className={classNames("btn btn-dark btn-sm", { loading: share.isPending })} id="share" onClick={() => share.mutate()}>
							کپی لینک لیست
						</button>
					</div>
				</Reveal>
			)}
			*/}
		</>
	);
}
