"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import classNames from "classnames";
import { useMutation } from "@tanstack/react-query";
import { Icon } from "@/app/_components/icon/icons";
import { toast } from "@/store/notification.store";
import { digitsOnly, toPersianDigits } from "@/utils/digits";
import { withMappedError } from "@/utils/withMappedError";
import { AuthEndpoints } from "../../../_api/authEndpoints";
import { SendOtpResponse } from "../../../_types/auth.type";

const PHONE = /^09\d{9}$/;
const PHONE_ERROR = "شماره موبایل باید ۱۱ رقم باشه و با ۰۹ شروع بشه";

type PhoneStepProps = {
	/** Kept when the shopper comes back with «ویرایش». */
	initialPhone: string;
	onSent: (phone: string, sent: SendOtpResponse) => void;
};

/** Step ۱ «ورود یا ثبت‌نام» — mobile number → an SMS code. */
export default function PhoneStep({ initialPhone, onSent }: PhoneStepProps) {
	const [phone, setPhone] = useState(initialPhone);
	const [error, setError] = useState<string | null>(null);

	const send = useMutation({
		mutationFn: (value: string) => withMappedError(() => AuthEndpoints.sendOtp(value)),
		onSuccess: (res, value) => {
			toast("کد تأیید پیامک شد", { icon: "mail" });
			onSent(res.phone || value, res);
		},
		// a rejected number is an answer for the field; anything else (rate limit, network) is a toast
		onError: (e) => {
			const field = e.errorDetails?.find((d) => d.field === "phone");
			if (field || e.code === "PHONE_INVALID") setError(field?.message ?? e.description);
			else toast(e.description, { type: "error" });
		},
	});

	const submit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!PHONE.test(phone)) {
			setError(PHONE_ERROR);
			document.getElementById("phone")?.focus();
			return;
		}
		send.mutate(phone);
	};

	return (
		<form className="astep on" id="s1" noValidate onSubmit={submit}>
			<h1>ورود یا ثبت‌نام</h1>
			<p>شماره موبایلت رو وارد کن؛ کد تأیید برات پیامک می‌شه.</p>
			<div className={classNames("field", { error: !!error })} id="phField">
				<label htmlFor="phone" className="sr-only">
					شماره موبایل
				</label>
				<div className="phone-in">
					<input
						className="input"
						id="phone"
						inputMode="numeric"
						autoComplete="tel"
						maxLength={11}
						placeholder="۰۹۱۲ ۳۴۵ ۶۷۸۹"
						autoFocus
						value={toPersianDigits(phone)}
						aria-invalid={!!error || undefined}
						onChange={(e) => {
							setPhone(digitsOnly(e.target.value, 11).en);
							setError(null);
						}}
					/>
					<span className="pre">
						<Icon name="phone" />
					</span>
				</div>
				<span className="err">{error ?? PHONE_ERROR}</span>
			</div>
			<button type="submit" className={classNames("btn btn-primary btn-lg btn-block", { loading: send.isPending })} style={{ marginTop: 18 }} id="sendBtn">
				دریافت کد تأیید <Icon name="arrow" />
			</button>
			<p className="terms">
				ورودت به معنی پذیرش <Link href="/pages/terms">قوانین و حریم خصوصی</Link> کیواست.
			</p>
		</form>
	);
}
