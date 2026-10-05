"use client";

import Link from "next/link";
import classNames from "classnames";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import ErrorComponent from "@/app/_components/common/errorComponent2/errorComponent2";
import Loading from "@/app/_components/common/loading/loading";
import { Icon } from "@/app/_components/icon/icons";
import BagArt from "@/app/_components/shop/bagArt/bagArt";
import MediaImage from "@/app/_components/shop/mediaImage/mediaImage";
import { CartEndpoints } from "@/app/cart/_api/cartEndpoints";
import { ERROR_BEHAVIOUR } from "@/app/cart/_utils/apiError";
import { useAuthStore } from "@/store/auth.store";
import { useUiStore } from "@/store/ui.store";
import { toErrorView } from "@/utils/apiError";
import { toPersianDigits } from "@/utils/digits";
import { formatPrice } from "@/utils/format";
import { withMappedError } from "@/utils/withMappedError";

/** `#kvCart` — the left drawer: mini items, free-shipping progress, cart total. */
export default function CartDrawer() {
	const queryClient = useQueryClient();
	const panel = useUiStore((s) => s.panel);
	const closeAll = useUiStore((s) => s.closeAll);
	const hydrated = useAuthStore((s) => s.hydrated);
	const isOpen = panel === "cart";

	const cart = useQuery({
		queryKey: ["cart"],
		queryFn: () => withMappedError(() => CartEndpoints.getCart()),
		enabled: hydrated,
	});

	const removeItem = useMutation({
		mutationFn: (itemId: string) => withMappedError(() => CartEndpoints.removeItem(itemId)),
		meta: { showNotification: true },
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] }),
	});

	const items = cart.data?.items ?? [];
	const count = cart.data?.totals.itemsCount ?? 0;
	const free = cart.data?.freeShipping;

	const cartError = toErrorView(ERROR_BEHAVIOUR, cart.error, "دریافت سبد خرید با خطا مواجه شد.");

	return (
		<aside className={classNames("drawer left", { on: isOpen })} id="kvCart" aria-label="سبد خرید" aria-hidden={!isOpen}>
			<div className="drawer-head">
				<h3>
					<Icon name="bag" /> سبد خرید {count > 0 && <span className="tag">{toPersianDigits(count)} کالا</span>}
				</h3>
				<button type="button" className="icon-btn" aria-label="بستن" onClick={closeAll}>
					<Icon name="close" />
				</button>
			</div>

			<div className="drawer-body">
				{cart.isLoading || (!hydrated && !cart.data) ? (
					<Loading />
				) : cartError ? (
					<ErrorComponent
						retryable={cartError.retryable}
						ticketAble={cartError.ticketAble}
						errorText={cartError.errorText}
						executeFunction={() => cart.refetch()}
						variant="text"
						loading={cart.isFetching}
					/>
				) : !items.length ? (
					<div className="empty">
						<div className="art">
							<BagArt type="tote" color="lilac" variant={2} />
						</div>
						<h4>سبد خریدت خالیه</h4>
						<p>یه سر به فروشگاه بزن، حتماً یه چیزی به دلت می‌شینه.</p>
					</div>
				) : (
					items.map((item) => (
						<div className="mini-item" key={item.id}>
							<Link className="th" href={item.product.url ?? `/product/${item.product.slug}?color=${item.color.key}`} onClick={closeAll}>
								<MediaImage src={item.image?.url} alt={item.product.name} />
							</Link>
							<div>
								<h4>{item.product.name}</h4>
								<div className="meta">
									<span className="swatch-dot" style={{ background: item.color.hex }} />
									{item.color.name} · {toPersianDigits(item.quantity)} عدد
								</div>
								<div className="pr">
									{formatPrice(item.lineTotal)} <small className="muted">تومان</small>
								</div>
							</div>
							<button
								type="button"
								className="icon-btn"
								aria-label="حذف"
								onClick={() => removeItem.mutate(item.id)}
								disabled={removeItem.isPending && removeItem.variables === item.id}
							>
								<Icon name="trash" />
							</button>
						</div>
					))
				)}
			</div>

			<div className="drawer-foot">
				{!items.length ? (
					<Link className="btn btn-primary btn-block" href="/products" onClick={closeAll}>
						رفتن به فروشگاه <Icon name="arrow" />
					</Link>
				) : (
					<>
						{free && !free.eligible ? (
							<div className="note">
								<Icon name="truck" />
								<span>
									فقط <b>{formatPrice(free.remaining)}</b> تومان تا ارسال رایگان با پست
								</span>
							</div>
						) : (
							<div className="note success">
								<Icon name="check" />
								<span>ارسال با پست برات رایگانه!</span>
							</div>
						)}
						<div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, margin: "4px 0" }}>
							<span>جمع سبد</span>
							<span>
								{formatPrice(cart.data?.totals.subtotal ?? 0)} <small className="muted">تومان</small>
							</span>
						</div>
						<Link className="btn btn-primary btn-block" href="/cart" onClick={closeAll}>
							مشاهده سبد و ادامه خرید <Icon name="arrow" />
						</Link>
					</>
				)}
			</div>
		</aside>
	);
}
