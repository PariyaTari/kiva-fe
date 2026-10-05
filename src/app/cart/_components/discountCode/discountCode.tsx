"use client";

import { FormEvent, useState } from "react";
import classNames from "classnames";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Icon } from "@/app/_components/icon/icons";
import { toast } from "@/store/notification.store";
import { AppliedDiscount } from "@/types/cart.type";
import { ResultError } from "@/types/result";
import { formatPrice } from "@/utils/format";
import { withMappedError } from "@/utils/withMappedError";
import { CartEndpoints } from "../../_api/cartEndpoints";
import { DISCOUNT_CODES } from "../../_utils/apiError";

/** The prototype lists the mock backend's codes under the field — useful while developing, wrong in production. */
const SHOW_TEST_CODES = process.env.NODE_ENV !== "production";

/** «کد تخفیف» block — form, or the applied code with «حذف کد». */
export default function DiscountCode({ discount }: { discount?: AppliedDiscount | null }) {
	const queryClient = useQueryClient();
	const [code, setCode] = useState("");
	// a new key replays the `.code-err` shake for every failed try
	const [error, setError] = useState<{ text: string; key: number } | null>(null);

	const showError = (text: string) => setError((e) => ({ text, key: (e?.key ?? 0) + 1 }));

	const apply = useMutation({
		mutationFn: (value: string) => withMappedError(() => CartEndpoints.applyDiscountCode(value)),
		onSuccess: (cart) => {
			queryClient.invalidateQueries({ queryKey: ["cart"] });
			setCode("");
			setError(null);
			toast(`کد تخفیف اعمال شد: ${formatPrice(cart.discount?.amount ?? cart.totals.codeDiscount)} تومان کمتر پرداخت می‌کنی`, { icon: "tag" });
		},
		// a rejected code is an answer for the field; anything else is a real failure
		onError: (e: ResultError) => (DISCOUNT_CODES.includes(e.code) ? showError(e.description) : toast(e.description, { type: "error" })),
	});

	const remove = useMutation({
		mutationFn: () => withMappedError(() => CartEndpoints.removeDiscountCode()),
		meta: { showNotification: true },
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] }),
	});

	const submit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const value = code.trim();
		if (!value) return showError("کد تخفیف رو وارد کن");
		apply.mutate(value);
	};

	return (
		<div className="block">
			<h3>
				<Icon name="tag" /> کد تخفیف
			</h3>
			{discount ? (
				<div className="code-ok">
					<span>
						<Icon name="check" width={16} height={16} style={{ display: "inline", verticalAlign: -3 }} /> کد <b>{discount.code.toUpperCase()}</b> اعمال شد —{" "}
						{discount.label}
					</span>
					<button type="button" id="codeRm" disabled={remove.isPending} onClick={() => remove.mutate()}>
						حذف کد
					</button>
				</div>
			) : (
				<>
					<form className="code-row" id="codeForm" onSubmit={submit}>
						<input className="input" id="codeIn" placeholder="کد تخفیف" aria-label="کد تخفیف" value={code} onChange={(e) => setCode(e.target.value)} />
						<button className={classNames("btn btn-dark", { loading: apply.isPending })} type="submit">
							اعمال
						</button>
					</form>
					<div key={error?.key} className={classNames("code-err", { on: !!error })} id="codeErr" role="alert">
						{error?.text}
					</div>
					{SHOW_TEST_CODES && (
						<p className="muted" style={{ fontSize: 12, marginTop: 10 }}>
							کدهای آزمایشی: KIVA10 ، WELCOME ، PAEEZ15
						</p>
					)}
				</>
			)}
		</div>
	);
}
