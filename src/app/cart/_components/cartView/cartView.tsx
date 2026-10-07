"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import ErrorComponent from "@/app/_components/common/errorComponent2/errorComponent2";
import Loading from "@/app/_components/common/loading/loading";
import { Icon } from "@/app/_components/icon/icons";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "@/store/notification.store";
import { Cart } from "@/types/cart.type";
import { toErrorView } from "@/utils/apiError";
import { toPersianDigits } from "@/utils/digits";
import { formatPrice } from "@/utils/format";
import { withMappedError } from "@/utils/withMappedError";
import { CartEndpoints } from "../../_api/cartEndpoints";
import { ERROR_BEHAVIOUR } from "../../_utils/apiError";
import CartItemRow from "../cartItemRow/cartItemRow";
import CartSummary from "../cartSummary/cartSummary";
import DiscountCode from "../discountCode/discountCode";
import EmptyCart from "../emptyCart/emptyCart";
import ReserveBox from "../reserveBox/reserveBox";
import ShippingOptions from "../shippingOptions/shippingOptions";

/** Cart page body (`#cartRoot`) + the mobile pay bar. */
export default function CartView() {
	const router = useRouter();
	const hydrated = useAuthStore((s) => s.hydrated);
	const signedIn = useAuthStore((s) => !!s.accessToken);
	const totalRef = useRef<HTMLElement>(null);
	const lastTotal = useRef<number | null>(null);
	const seenIssues = useRef<Cart | null>(null);

	// shared with the header badge and the drawer; the guest token / bearer is ready once the session is read
	const cart = useQuery({
		queryKey: ["cart"],
		queryFn: () => withMappedError(() => CartEndpoints.getCart()),
		enabled: hydrated,
	});

	const data = cart.data;
	const payable = data?.totals.payable;

	// the total pulses when it changes (design `bumpTotal`)
	useEffect(() => {
		if (payable == null) return;
		if (lastTotal.current !== null && lastTotal.current !== payable) {
			totalRef.current?.animate([{ transform: "scale(1.12)", color: "#5B3E8C" }, { transform: "none" }], { duration: 500, easing: "ease-out" });
		}
		lastTotal.current = payable;
	}, [payable]);

	// stock / price changes found while re-reading the cart come once — tell the shopper
	useEffect(() => {
		if (!data?.issues?.length || seenIssues.current === data) return;
		seenIssues.current = data;
		data.issues.forEach((issue) => toast(issue.message, { icon: "info", type: "warning" }));
	}, [data]);

	if (!hydrated || cart.isLoading)
		return (
			<div className="container">
				<Loading />
			</div>
		);

	const cartError = toErrorView(ERROR_BEHAVIOUR, cart.error, "دریافت سبد خرید با خطا مواجه شد.");
	if (cartError)
		return (
			<div className="container" style={{ paddingTop: 36 }}>
				<ErrorComponent
					retryable={cartError.retryable}
					ticketAble={cartError.ticketAble}
					errorText={cartError.errorText}
					executeFunction={() => cart.refetch()}
					loading={cart.isFetching}
				/>
			</div>
		);

	if (!data) return null;

	if (!data.items.length)
		return (
			<div className="container" id="cartRoot">
				<EmptyCart />
			</div>
		);

	const checkout = () => router.push(signedIn ? "/checkout" : `/login?next=${encodeURIComponent("/checkout")}`);

	return (
		<>
			<div className="container" id="cartRoot">
				<div className="cart-wrap">
					<div>
						<div className="block">
							<h3>
								<Icon name="bag" /> کالاهای سبد <span className="tag">{toPersianDigits(data.totals.itemsCount)} کالا</span>
							</h3>
							<div id="items">
								{data.items.map((item) => (
									<CartItemRow key={item.id} item={item} />
								))}
							</div>
						</div>

						<ShippingOptions options={data.shippingOptions} selected={data.shippingMethod} lockedTo={data.consolidation?.shippingMethod} />

						{/* optional, beside the shipping method; hidden only when reserving is off site-wide */}
						{data.reservation.unavailableReason !== "RESERVATION_DISABLED" && <ReserveBox reservation={data.reservation} consolidation={data.consolidation} />}

						<DiscountCode discount={data.discount} />
					</div>

					<CartSummary cart={data} signedIn={signedIn} totalRef={totalRef} onCheckout={checkout} />
				</div>
			</div>

			<div className="m-pay" id="mPay">
				<div>
					{formatPrice(data.totals.payable)}
					<small>تومان</small>
				</div>
				<button type="button" className="btn btn-primary" onClick={checkout}>
					ادامه خرید
				</button>
			</div>
		</>
	);
}
