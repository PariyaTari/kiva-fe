"use client";

import { FormEvent, useEffect, useState } from "react";
import classNames from "classnames";
import { useMutation } from "@tanstack/react-query";
import { Icon } from "@/app/_components/icon/icons";
import { useCartStore } from "@/store/cart.store";
import { toast } from "@/store/notification.store";
import { AuthResponse } from "@/types/user.type";
import { toPersianDigits } from "@/utils/digits";
import { formatPhone, pad2 } from "@/utils/format";
import { withMappedError } from "@/utils/withMappedError";
import OtpInput from "../../../_components/otpInput/otpInput";
import { AuthEndpoints } from "../../../_api/authEndpoints";
import { SendOtpResponse } from "../../../_types/auth.type";

/** The prototype tells testers any code works — true for the mock backend only. */
const SHOW_DEMO_NOTE = process.env.NODE_ENV !== "production";
const RING = 2 * Math.PI * 10;

type OtpStepProps = {
	phone: string;
	sent: SendOtpResponse;
	onEdit: () => void;
	onVerified: (res: AuthResponse) => void;
};

/** Step ۲ «کد تأیید رو وارد کن» — the code boxes, the circular resend timer and «تأیید و ورود». */
export default function OtpStep({ phone, sent: firstSent, onEdit, onVerified }: OtpStepProps) {
	const [sent, setSent] = useState(() => ({ ...firstSent, at: Date.now() }));
	const [now, setNow] = useState(() => Date.now());
	const [code, setCode] = useState("");
	const [shake, setShake] = useState(0);
	const [ok, setOk] = useState(false);
	const length = sent.codeLength || 5;
	const total = Math.max(1, sent.resendAvailableInSeconds);
	const left = Math.max(0, Math.ceil((sent.at + total * 1000 - now) / 1000));

	// ticks once a second while the resend countdown runs (freezes once verified, like the design)
	useEffect(() => {
		if (ok || left <= 0) return;
		const timer = setInterval(() => setNow(Date.now()), 1000);
		return () => clearInterval(timer);
	}, [ok, left]);

	const resend = useMutation({
		mutationFn: () => withMappedError(() => AuthEndpoints.sendOtp(phone)),
		meta: { showNotification: true },
		onSuccess: (res) => {
			setSent({ ...res, at: Date.now() });
			setNow(Date.now());
			toast("کد جدید پیامک شد", { icon: "mail" });
		},
	});

	const verify = useMutation({
		mutationFn: (value: string) =>
			withMappedError(() => AuthEndpoints.verifyOtp({ phone, code: value, guestCartToken: useCartStore.getState().guestToken })),
		onSuccess: (res) => {
			setOk(true);
			onVerified(res);
		},
		// wrong / expired code: the boxes shake and empty for a new try
		onError: (e) => {
			setCode("");
			setShake((n) => n + 1);
			toast(e.description, { type: "error" });
		},
	});

	const submit = (value = code) => {
		if (verify.isPending || ok) return;
		if (!new RegExp(`^\\d{${length}}$`).test(value)) return setShake((n) => n + 1);
		verify.mutate(value);
	};

	return (
		<form
			className="astep on"
			id="s2"
			noValidate
			onSubmit={(e: FormEvent<HTMLFormElement>) => {
				e.preventDefault();
				submit();
			}}
		>
			<h1>کد تأیید رو وارد کن</h1>
			<p>کد {toPersianDigits(length)} رقمی که برات پیامک شد رو بنویس.</p>
			<div className="sent-to">
				<span>
					ارسال شده به <b id="sentTo">{formatPhone(phone)}</b>
				</span>
				<button type="button" id="editPh" onClick={onEdit}>
					<Icon name="edit" />
					ویرایش
				</button>
			</div>
			<OtpInput
				length={length}
				value={code}
				onChange={(next) => {
					setCode(next);
					setShake(0);
				}}
				onComplete={submit}
				error={shake > 0}
				errorKey={shake}
				ok={ok}
				autoFocus
			/>
			<div className="timer" id="timer">
				{left > 0 ? (
					<>
						<svg className="ring" viewBox="0 0 24 24">
							<circle cx="12" cy="12" r="10" fill="none" stroke="#E4D9F3" strokeWidth="2.5" />
							<circle
								cx="12"
								cy="12"
								r="10"
								fill="none"
								stroke="#5B3E8C"
								strokeWidth="2.5"
								strokeLinecap="round"
								strokeDasharray={RING}
								strokeDashoffset={RING * (1 - left / total)}
								transform="rotate(-90 12 12)"
							/>
						</svg>{" "}
						ارسال مجدد تا{" "}
						<b>
							{pad2(Math.floor(left / 60))}:{pad2(left % 60)}
						</b>
					</>
				) : ok ? null : (
					<>
						کد رو دریافت نکردی؟{" "}
						<button type="button" id="resend" disabled={resend.isPending} onClick={() => resend.mutate()}>
							ارسال مجدد کد
						</button>
					</>
				)}
			</div>
			<button type="submit" className={classNames("btn btn-primary btn-lg btn-block", { loading: verify.isPending })} id="verifyBtn">
				تأیید و ورود
			</button>
			{SHOW_DEMO_NOTE && <p className="demo">نسخه نمایشی: هر کد ۵ رقمی پذیرفته می‌شه.</p>}
		</form>
	);
}
