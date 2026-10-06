"use client";

import { FormEvent, useRef, useState } from "react";
import classNames from "classnames";
import { useMutation } from "@tanstack/react-query";
import { Icon } from "@/app/_components/icon/icons";
import BagArt from "@/app/_components/shop/bagArt/bagArt";
import Input from "@/app/_components/ui/input/input";
import { toast } from "@/store/notification.store";
import { convertPersianToEnglishString, digitsOnly, toPersianDigits } from "@/utils/digits";
import { withMappedError } from "@/utils/withMappedError";
import { TrackEndpoints } from "../../_api/trackEndpoints";
import { isTrackingNotFoundError } from "../../_utils/apiError";
import TrackResult from "../trackResult/trackResult";

const ORDER_ERROR = "شماره سفارش رو درست وارد کن";
const PHONE_ERROR = "موبایل ۱۱ رقمی وارد کن";

/** `KV-215566`, `kv215566` or just `215566` → `KV-215566` (design). */
const normalizeCode = (value: string) => convertPersianToEnglishString(value).trim().toUpperCase().replace(/^(KV)?-?/, "KV-");

/** `.track-card` — order number + mobile, no login; the answer appears under the form. */
export default function TrackLookup({ initialOrder = "" }: { initialOrder?: string }) {
	const [order, setOrder] = useState(initialOrder);
	const [phone, setPhone] = useState("");
	const [errors, setErrors] = useState<{ order?: string; phone?: string }>({});
	const resultRef = useRef<HTMLDivElement>(null);

	const lookup = useMutation({
		mutationFn: (payload: { orderCode: string; phone: string }) => withMappedError(() => TrackEndpoints.lookup(payload)),
		// after the answer is drawn, bring it into view (design)
		onSettled: () => setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" })),
		// not found is an answer (shown below the form); field errors go back on the fields; the rest is a toast
		onError: (e) => {
			if (isTrackingNotFoundError(e)) return;
			const fields = e.errorDetails ?? [];
			const orderField = fields.find((d) => d.field === "orderCode");
			const phoneField = fields.find((d) => d.field === "phone");
			if (orderField || phoneField) setErrors({ order: orderField?.message, phone: phoneField?.message });
			else toast(e.description, { type: "error" });
		},
	});

	const submit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const code = normalizeCode(order);
		const next = {
			order: /^KV-\d{4,8}$/.test(code) ? undefined : ORDER_ERROR,
			phone: /^09\d{9}$/.test(phone) ? undefined : PHONE_ERROR,
		};
		setErrors(next);
		if (next.order || next.phone) return;
		lookup.mutate({ orderCode: code, phone });
	};

	return (
		<div className="track-card">
			<form className="track-form" id="tf" noValidate onSubmit={submit}>
				<Input
					id="ord"
					wrapperId="fOrd"
					label="شماره سفارش"
					direction="ltr"
					placeholder="مثلاً KV-215566"
					value={order}
					error={errors.order}
					onChange={(e) => {
						setOrder(e.target.value);
						setErrors((x) => ({ ...x, order: undefined }));
					}}
				/>
				<Input
					id="ph"
					wrapperId="fPh"
					label="شماره موبایل"
					direction="ltr"
					inputMode="numeric"
					maxLength={11}
					placeholder="۰۹۱۲۳۴۵۶۷۸۹"
					value={toPersianDigits(phone)}
					error={errors.phone}
					onChange={(e) => {
						setPhone(digitsOnly(e.target.value, 11).en);
						setErrors((x) => ({ ...x, phone: undefined }));
					}}
				/>
				<button type="submit" className={classNames("btn btn-primary", { loading: lookup.isPending })} id="tBtn">
					<Icon name="search" /> پیگیری
				</button>
			</form>
			<p className="hint">
				<Icon name="info" />
				شماره سفارش توی پیامک تأیید خرید و پیام‌رسانت فرستاده شده.
			</p>
			<div id="result" ref={resultRef}>
				{lookup.data && !lookup.isPending ? (
					<TrackResult order={lookup.data} />
				) : isTrackingNotFoundError(lookup.error) && !lookup.isPending ? (
					<div className="result">
						<div className="not-found">
							<div className="art">
								<BagArt type="cross" color="lilac" variant={2} />
							</div>
							<h4>سفارشی پیدا نشد</h4>
							<p className="muted">{lookup.error?.description}</p>
						</div>
					</div>
				) : null}
			</div>
		</div>
	);
}
