"use client";

import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addressErrorsFrom, toAddressInput } from "@/app/_components/address/_utils/addressForm";
import ErrorComponent from "@/app/_components/common/errorComponent2/errorComponent2";
import Loading from "@/app/_components/common/loading/loading";
import BagArt from "@/app/_components/shop/bagArt/bagArt";
import { useAddressForm } from "@/hooks/useAddressForm";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "@/store/notification.store";
import { PaymentGatewayCode, PhotoMessengerChannel } from "@/types/order.type";
import { toErrorView } from "@/utils/apiError";
import { toPersianDigits } from "@/utils/digits";
import { newIdempotencyKey, redirectToGateway } from "@/utils/payment";
import { withMappedError } from "@/utils/withMappedError";
import { CheckoutEndpoints } from "../../_api/checkoutEndpoints";
import { CheckoutContext, PlaceOrderPayload } from "../../_types/checkout.type";
import { ERROR_BEHAVIOUR, isCartEmptyError, REREAD_CONTEXT_CODES, WARNING_CODES } from "../../_utils/apiError";
import AddressBlock from "../addressBlock/addressBlock";
import CheckoutHero from "../checkoutHero/checkoutHero";
import GatewayBlock from "../gatewayBlock/gatewayBlock";
import OrderSummary from "../orderSummary/orderSummary";
import ShippingBlock from "../shippingBlock/shippingBlock";
import SignatureBlock from "../signatureBlock/signatureBlock";
import SuccessModal from "../successModal/successModal";

const PHONE = /^09\d{9}$/;
const PHONE_ERROR = "شماره موبایل معتبر وارد کن";

/** The success modal's steps when nothing was left to pay (no payment, so no `nextSteps` from the result page). */
function localNextSteps(ctx: CheckoutContext, messenger: PhotoMessengerChannel, reserved: boolean, shippingName: string) {
	const messengerName = ctx.messengers.find((m) => m.channel === messenger)?.name ?? "";
	return [
		ctx.consolidation
			? ctx.consolidation.message
			: reserved
				? `سفارشت تا ${toPersianDigits(ctx.reservation?.holdDays ?? 4)} روز رزرو می‌مونه؛ هر خریدی داشتی به همین سفارش اضافه می‌شه.`
				: "سفارشت در حال آماده‌سازیه.",
		`عکس و ویدیوی کیفت رو قبل از ارسال توی ${messengerName} برات می‌فرستیم.`,
		`بعد از تحویل به ${shippingName}، کد رهگیری توی حسابت قرار می‌گیره.`,
	];
}

/** Checkout page (`checkout.html`) — hero + `#coRoot`: address → signature (messenger) → shipping → gateway, and the summary. */
export default function CheckoutView() {
	const router = useRouter();
	const queryClient = useQueryClient();
	const hydrated = useAuthStore((s) => s.hydrated);
	const signedIn = useAuthStore((s) => !!s.accessToken);
	const user = useAuthStore((s) => s.user);

	// the shopper's picks — `null` falls back to the server's default from the context
	const [addressPick, setAddressPick] = useState<number | null>(null);
	const [newOpen, setNewOpen] = useState(false);
	const [saveAddress, setSaveAddress] = useState(true);
	const [messengerPick, setMessengerPick] = useState<PhotoMessengerChannel | null>(null);
	const [messengerError, setMessengerError] = useState(false);
	const [phonePick, setPhonePick] = useState<string | null>(null);
	const [phoneError, setPhoneError] = useState<string | null>(null);
	const [note, setNote] = useState("");
	const [gatewayPick, setGatewayPick] = useState<PaymentGatewayCode | null>(null);
	const [redirecting, setRedirecting] = useState(false);
	const [placed, setPlaced] = useState<{ code: string; nextSteps: string[] } | null>(null);
	const { values: addressValues, errors: addressErrors, formRef: addressFormRef, change: changeAddress, validate: validateAddress, showErrors: showAddressErrors, reset: resetAddress } = useAddressForm();
	const sigRef = useRef<HTMLDivElement>(null);
	/** Last place-order body and its `Idempotency-Key`. */
	const attempt = useRef<{ body: string; key: string } | null>(null);

	// checkout is for signed-in shoppers only — guests log in and come back (design `location.replace`)
	useEffect(() => {
		if (hydrated && !signedIn && !placed) router.replace(`/login?next=${encodeURIComponent("/checkout")}`);
	}, [hydrated, signedIn, placed, router]);

	const checkout = useQuery({
		queryKey: ["checkout", { addressId: addressPick }],
		queryFn: () => withMappedError(() => CheckoutEndpoints.getContext(addressPick)),
		enabled: hydrated && signedIn && !placed,
		placeholderData: keepPreviousData,
		meta: { showNotificationOnRefetch: true },
	});

	const ctx = checkout.data;
	const addresses = ctx?.addresses ?? [];
	// with no saved address the form is the only way
	const isNew = newOpen || (!!ctx && !addresses.length);
	const selectedAddressId = addressPick ?? ctx?.selectedAddressId ?? addresses[0]?.id ?? null;
	const messenger = messengerPick ?? ctx?.selectedMessenger ?? null;
	const phone = phonePick ?? ctx?.messengerPhone ?? user?.phone ?? "";
	const gateways = ctx?.paymentGateways ?? [];
	const usable = gateways.filter((g) => g.available !== false);
	const gateway = gatewayPick ?? (usable.find((g) => g.isDefault) ?? usable[0])?.code ?? null;

	const shakeSignature = () => {
		setMessengerError(true);
		const block = sigRef.current;
		block?.scrollIntoView({ behavior: "smooth", block: "center" });
		block?.animate([{ transform: "translateX(0)" }, { transform: "translateX(-8px)" }, { transform: "translateX(8px)" }, { transform: "none" }], {
			duration: 400,
			delay: 350,
		});
	};

	const showPhoneError = (text: string) => {
		setPhoneError(text);
		document.getElementById("mPhone")?.focus();
	};

	const scrollToNewAddress = () => document.getElementById("newAddr")?.scrollIntoView({ behavior: "smooth", block: "center" });

	const place = useMutation({
		mutationFn: (payload: PlaceOrderPayload) => {
			// a resend of the same body keeps its key (a lost response never places two orders); a changed body is a new attempt
			const body = JSON.stringify(payload);
			if (attempt.current?.body !== body) attempt.current = { body, key: newIdempotencyKey() };
			const key = attempt.current.key;
			return withMappedError(() => CheckoutEndpoints.placeOrder(payload, key));
		},
		onSuccess: (res, payload) => {
			queryClient.invalidateQueries({ queryKey: ["cart"] });
			queryClient.invalidateQueries({ queryKey: ["me"] });
			if (res.payment) {
				setRedirecting(true);
				redirectToGateway(res.payment.redirect);
				return;
			}
			// nothing left to pay (a full discount) — the order is already paid
			if (ctx)
				setPlaced({
					code: res.order.code,
					nextSteps: localNextSteps(ctx, payload.preShipmentMessenger.channel, !!res.order.reservation?.active || !!payload.reserve, res.order.shippingMethod.name),
				});
		},
		onError: (e) => {
			// answers about a field are shown on the field, like the client-side checks
			if (e.code === "MESSENGER_REQUIRED") return shakeSignature();
			if (e.code === "MESSENGER_PHONE_INVALID") return showPhoneError(e.description || PHONE_ERROR);
			if (e.code === "VALIDATION_ERROR") {
				const fieldErrors = addressErrorsFrom(e.errorDetails, "newAddress.");
				if (isNew && Object.keys(fieldErrors).length) {
					showAddressErrors(fieldErrors);
					return scrollToNewAddress();
				}
				const phoneDetail = e.errorDetails?.find((d) => d.field === "preShipmentMessenger.phone");
				if (phoneDetail) return showPhoneError(phoneDetail.message);
			}
			// the price, stock or cart moved — show the new state
			if (REREAD_CONTEXT_CODES.includes(e.code)) queryClient.invalidateQueries({ queryKey: ["checkout"] });
			toast(e.description, { type: WARNING_CODES.includes(e.code) ? "warning" : "error" });
		},
	});

	const pay = () => {
		if (!ctx) return;
		// 1. address
		let addressPart: Pick<PlaceOrderPayload, "addressId" | "newAddress" | "saveNewAddress">;
		if (isNew) {
			const values = validateAddress();
			if (!values) return scrollToNewAddress();
			addressPart = { newAddress: toAddressInput(values), saveNewAddress: saveAddress };
		} else {
			addressPart = { addressId: selectedAddressId };
		}
		// 2. messenger — required, it's the brand signature — and its number
		if (!messenger) return shakeSignature();
		if (!PHONE.test(phone)) return showPhoneError(PHONE_ERROR);
		// 3. shipping and 4. gateway come preselected from the context
		if (!gateway) return toast("یکی از درگاه‌های پرداخت رو انتخاب کن", { type: "warning" });

		place.mutate({
			...addressPart,
			preShipmentMessenger: { channel: messenger, phone, note: note.trim() || null, saveAsDefault: true },
			// a joining order ships with its reservation group; the switch only counts while it's available
			shippingMethod: ctx.consolidation?.shippingMethod ?? ctx.cart.shippingMethod,
			reserve: !!ctx.reservation?.available && !!ctx.reservation.enabled,
			paymentGateway: gateway,
			expectedPayable: ctx.cart.totals.payable,
			acceptTerms: true,
		});
	};

	const openNewAddress = () => {
		resetAddress();
		// render the form first, then bring it into view (design)
		flushSync(() => setNewOpen(true));
		scrollToNewAddress();
	};

	if (placed)
		return (
			<>
				<CheckoutHero stage="paid" />
				<div className="container" id="coRoot" />
				<SuccessModal orderCode={placed.code} nextSteps={placed.nextSteps} onClose={() => router.push("/account/orders")} />
			</>
		);

	const cartEmpty = isCartEmptyError(checkout.error);
	const checkoutError = cartEmpty ? null : toErrorView(ERROR_BEHAVIOUR, checkout.error, "دریافت اطلاعات تکمیل خرید با خطا مواجه شد.");

	return (
		<>
			<CheckoutHero />
			<div className="container" id="coRoot">
				{!hydrated || !signedIn || checkout.isLoading ? (
					<Loading />
				) : cartEmpty ? (
					<div className="empty" style={{ padding: "80px 0" }}>
						<div className="art">
							<BagArt type="tote" color="lilac" variant={2} />
						</div>
						<h4>سبد خریدت خالیه</h4>
						<p style={{ marginBottom: 18 }}>اول چند تا کیف به سبدت اضافه کن.</p>
						<Link className="btn btn-primary" href="/products">
							رفتن به فروشگاه
						</Link>
					</div>
				) : !!checkoutError ? (
					<div style={{ paddingTop: 36 }}>
						<ErrorComponent
							retryable={checkoutError.retryable}
							ticketAble={checkoutError.ticketAble}
							errorText={checkoutError.errorText}
							executeFunction={() => checkout.refetch()}
							loading={checkout.isFetching}
						/>
					</div>
				) : !checkout.error && !!ctx ? (
					<div className="co-wrap">
						<div>
							<AddressBlock
								addresses={addresses}
								selectedId={selectedAddressId}
								onSelect={(id) => {
									setAddressPick(id);
									setNewOpen(false);
								}}
								newOpen={isNew}
								onOpenNew={openNewAddress}
								formRef={addressFormRef}
								values={addressValues}
								errors={addressErrors}
								onChange={changeAddress}
								saveAddress={saveAddress}
								onSaveAddress={setSaveAddress}
								self={{ name: user?.fullName || [user?.firstName, user?.lastName].filter(Boolean).join(" "), phone: user?.phone }}
							/>

							<SignatureBlock
								blockRef={sigRef}
								messengers={ctx.messengers}
								messenger={messenger}
								onMessenger={(channel) => {
									setMessengerPick(channel);
									setMessengerError(false);
								}}
								messengerError={messengerError}
								phone={phone}
								onPhone={(value) => {
									setPhonePick(value);
									setPhoneError(null);
								}}
								phoneError={phoneError}
								note={note}
								onNote={setNote}
								previewImage={ctx.cart.items[0]?.image?.url}
							/>

							<ShippingBlock
								options={ctx.shippingOptions}
								selected={ctx.cart.shippingMethod}
								reservation={ctx.reservation}
								consolidation={ctx.consolidation}
							/>

							<GatewayBlock gateways={gateways} selected={gateway} onSelect={setGatewayPick} />
						</div>

						<OrderSummary
							cart={ctx.cart}
							messenger={ctx.messengers.find((m) => m.channel === messenger) ?? null}
							reserveOn={!!ctx.reservation?.available && !!ctx.reservation.enabled}
							holdDays={ctx.reservation?.holdDays ?? 4}
							termsUrl={ctx.termsUrl || "/faq"}
							paying={place.isPending || redirecting}
							onPay={pay}
						/>
					</div>
				) : null}
			</div>
		</>
	);
}
