"use client";

import { FormEvent, useEffect, useState } from "react";
import classNames from "classnames";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Icon } from "@/app/_components/icon/icons";
import Input from "@/app/_components/ui/input/input";
import Modal from "@/app/_components/ui/modal/modal";
import OtpInput from "@/app/_components/ui/otpInput/otpInput";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "@/store/notification.store";
import { digitsOnly, toPersianDigits } from "@/utils/digits";
import { formatPhone, pad2 } from "@/utils/format";
import { isDeadOtpError, isResendTooSoonError, otpErrorText, otpFieldOf, retryAfterOf } from "@/utils/otp";
import { withMappedError } from "@/utils/withMappedError";
import { AccountEndpoints } from "../../_api/accountEndpoints";
import { PhoneChangeOtpResponse } from "../../_types/account.type";
import ModalHead from "../modalHead/modalHead";

type PhoneChangeModalProps = {
	open: boolean;
	onClose: () => void;
	currentPhone: string;
};

type CodeField = "currentPhoneCode" | "newPhoneCode";
type Codes = Record<CodeField, string>;

const PHONE = /^09\d{9}$/;
const PHONE_ERROR = "شماره موبایل باید ۱۱ رقم باشه و با ۰۹ شروع بشه";
const EMPTY_CODES: Codes = { currentPhoneCode: "", newPhoneCode: "" };
const NO_ERRORS: Record<CodeField, string | null> = { currentPhoneCode: null, newPhoneCode: null };
const CODE_FIELDS: CodeField[] = ["currentPhoneCode", "newPhoneCode"];

const focusCode = (field: CodeField) => document.querySelector<HTMLInputElement>(`#${field} input`)?.focus();

/** A number in its own left-to-right run — the digit groups would otherwise line up right-to-left. */
const Phone = ({ value }: { value: string }) => <span className="ltr ph-num">{formatPhone(value)}</span>;

/**
 * «تغییر شماره موبایل» (`/me/phone-change/*`, FRONTEND_AUTH §6) — no design: the order modals' blocks and login's
 * code boxes. Both numbers are proven: one code goes to the current number, one to the new one. On success every
 * other device is signed out and this one gets a new session (token + cookie); the old number is free again.
 */
export default function PhoneChangeModal({ open, onClose, currentPhone }: PhoneChangeModalProps) {
	const queryClient = useQueryClient();
	const [view, setView] = useState<"phone" | "codes" | "done">("phone");
	const [phone, setPhone] = useState("");
	const [phoneError, setPhoneError] = useState<string | null>(null);
	const [sent, setSent] = useState<PhoneChangeOtpResponse | null>(null);
	const [resendAt, setResendAt] = useState(0);
	const [now, setNow] = useState(() => Date.now());
	const [codes, setCodes] = useState<Codes>(EMPTY_CODES);
	const [codeErrors, setCodeErrors] = useState(NO_ERRORS);
	const [shake, setShake] = useState<Record<CodeField, number>>({ currentPhoneCode: 0, newPhoneCode: 0 });
	const left = Math.max(0, Math.ceil((resendAt - now) / 1000));

	useEffect(() => {
		if (view !== "codes" || left <= 0) return;
		const tick = setInterval(() => setNow(Date.now()), 1000);
		return () => clearInterval(tick);
	}, [view, left]);

	const startTimer = (seconds: number) => {
		setResendAt(Date.now() + seconds * 1000);
		setNow(Date.now());
	};

	const failCode = (field: CodeField, message: string) => {
		setCodeErrors((errors) => ({ ...errors, [field]: message }));
		setCodes((c) => ({ ...c, [field]: "" }));
		setShake((s) => ({ ...s, [field]: s[field] + 1 }));
	};

	const request = useMutation({
		mutationFn: (newPhone: string) => withMappedError(() => AccountEndpoints.requestPhoneChange(newPhone)),
		onSuccess: (res) => {
			setSent(res);
			startTimer(res.resendAvailableInSeconds);
			setCodes(EMPTY_CODES);
			setCodeErrors(NO_ERRORS);
			setView("codes");
			toast("دو تا کد پیامک شد", { icon: "mail" });
		},
		onError: (e, newPhone) => {
			const field = e.errorDetails?.find((d) => d.field === "newPhone");
			const wait = retryAfterOf(e);
			// the codes for this same number went out moments ago and still work — back to them, timer running
			if (isResendTooSoonError(e) && wait && sent?.newPhone === newPhone) {
				startTimer(wait);
				setView("codes");
				return toast(otpErrorText(e), { type: "info" });
			}
			if (view === "phone") return setPhoneError(field?.message ?? otpErrorText(e));
			toast(otpErrorText(e), { type: "error" });
		},
	});

	const verify = useMutation({
		mutationFn: (payload: Codes & { newPhone: string }) => withMappedError(() => AccountEndpoints.verifyPhoneChange(payload)),
		onSuccess: (res) => {
			// the new session of this device; the other tabs pick it up through the session hint
			useAuthStore.getState().setSession(res.accessToken, res.user);
			queryClient.invalidateQueries({ queryKey: ["me"] });
			setView("done");
		},
		onError: (e) => {
			// both codes were right, but the number has an account of its own
			if (e.code === "PHONE_ALREADY_REGISTERED") {
				setPhoneError(e.description);
				return setView("phone");
			}
			// `meta.field` names the code at fault; the other one isn't spent and stays as typed
			const field = otpFieldOf(e) as CodeField | null;
			if (field && CODE_FIELDS.includes(field)) return failCode(field, isDeadOtpError(e) ? `${e.description} کد جدید بگیر.` : otpErrorText(e));
			const detail = e.errorDetails?.find((d) => CODE_FIELDS.includes(d.field as CodeField));
			if (detail) return failCode(detail.field as CodeField, detail.message);
			toast(otpErrorText(e), { type: "error" });
		},
	});

	const sendCodes = (e?: FormEvent<HTMLFormElement>) => {
		e?.preventDefault();
		if (!PHONE.test(phone)) {
			setPhoneError(PHONE_ERROR);
			return document.getElementById("pcPhone")?.focus();
		}
		if (phone === currentPhone) return setPhoneError("این همین شماره‌ی فعلیته؛ یه شماره‌ی دیگه بنویس.");
		request.mutate(phone);
	};

	const submitCodes = (next: Codes = codes) => {
		if (verify.isPending || !sent) return;
		const incomplete = CODE_FIELDS.filter((f) => !new RegExp(`^\\d{${sent.codeLength || 5}}$`).test(next[f]));
		if (incomplete.length) {
			setShake((s) => ({ ...s, ...Object.fromEntries(incomplete.map((f) => [f, s[f] + 1])) }));
			return focusCode(incomplete[0]);
		}
		verify.mutate({ newPhone: sent.newPhone, ...next });
	};

	const codeBlock = (field: CodeField, label: string, number: string) => (
		// not `.field`: its `.err{display:none}` would catch the boxes' own `.otp.err`
		<div className="m-sec ph-code">
			<div className="m-lb">
				{label}
				<small>
					<Phone value={number} />
				</small>
			</div>
			<OtpInput
				id={field}
				label={label}
				length={sent?.codeLength || 5}
				value={codes[field]}
				onChange={(value) => {
					setCodes((c) => ({ ...c, [field]: value }));
					setCodeErrors((errors) => ({ ...errors, [field]: null }));
					setShake((s) => ({ ...s, [field]: 0 }));
				}}
				// the first code done → on to the second; both done → verify, like login
				onComplete={(value) => {
					const next = { ...codes, [field]: value };
					const other = field === "currentPhoneCode" ? "newPhoneCode" : "currentPhoneCode";
					if (next[other].length < (sent?.codeLength || 5)) focusCode(other);
					else submitCodes(next);
				}}
				error={shake[field] > 0}
				errorKey={shake[field]}
				autoFocus={field === "currentPhoneCode"}
			/>
			{!!codeErrors[field] && <span className="ph-err">{codeErrors[field]}</span>}
		</div>
	);

	return (
		<Modal open={open} onClose={onClose} width={520}>
			<div className={classNames("mv", { in: view !== "phone" })} key={view}>
				{view === "done" && sent ? (
					<div className="m-done">
						<div className="ck">
							<Icon name="check" />
						</div>
						<h3>شماره‌ت عوض شد</h3>
						<p>
							از این به بعد با{" "}
							<b>
								<Phone value={sent.newPhone} />
							</b>{" "}
							وارد شو. از بقیه‌ی دستگاه‌ها خارج شدی و یه پیامک هم به شماره‌ی قبلی رفت که در جریان باشه.
						</p>
						<div className="acts">
							<button type="button" className="btn btn-primary btn-block" onClick={onClose}>
								باشه
							</button>
						</div>
					</div>
				) : view === "codes" && sent ? (
					<form
						noValidate
						onSubmit={(e) => {
							e.preventDefault();
							submitCodes();
						}}
					>
						<ModalHead icon="lock" title="کدها رو وارد کن" sub="یه کد به شماره‌ی فعلی و یه کد به شماره‌ی جدیدت پیامک کردیم." />
						{codeBlock("currentPhoneCode", "کد شماره‌ی فعلی", sent.currentPhone)}
						{codeBlock("newPhoneCode", "کد شماره‌ی جدید", sent.newPhone)}
						<div className="ph-timer">
							<span>
								{left > 0 ? (
									<>
										ارسال دوباره‌ی کدها تا{" "}
										<b>
											{pad2(Math.floor(left / 60))}:{pad2(left % 60)}
										</b>
									</>
								) : (
									<button type="button" disabled={request.isPending} onClick={() => request.mutate(sent.newPhone)}>
										ارسال دوباره‌ی کدها
									</button>
								)}
							</span>
							<button type="button" onClick={() => setView("phone")}>
								<Icon name="edit" /> ویرایش شماره
							</button>
						</div>
						<div className="m-foot">
							<button type="button" className="btn btn-outline" onClick={onClose}>
								انصراف
							</button>
							<button type="submit" className={classNames("btn btn-primary", { loading: verify.isPending })}>
								تأیید و تغییر شماره
							</button>
						</div>
					</form>
				) : (
					<form noValidate onSubmit={sendCodes}>
						<ModalHead icon="phone" title="تغییر شماره موبایل" sub="برای امنیت حسابت، یه کد به شماره‌ی فعلی و یه کد به شماره‌ی جدیدت پیامک می‌کنیم." />
						<div className="m-sec">
							<Input
								id="pcPhone"
								label="شماره‌ی جدید"
								direction="ltr"
								inputMode="numeric"
								autoComplete="tel"
								maxLength={11}
								placeholder="۰۹۱۲ ۳۴۵ ۶۷۸۹"
								autoFocus
								value={toPersianDigits(phone)}
								error={phoneError}
								hint={
									<>
										شماره‌ی فعلی: <Phone value={currentPhone} />
									</>
								}
								onChange={(e) => {
									setPhone(digitsOnly(e.target.value, 11).en);
									setPhoneError(null);
								}}
							/>
						</div>
						<div className="note cream" style={{ marginTop: 16 }}>
							<Icon name="shield" />
							<span>
								بعد از تغییر، از بقیه‌ی دستگاه‌ها خارج می‌شی و ورود با شماره‌ی جدید انجام می‌شه. اگه به شماره‌ی فعلیت دسترسی نداری، با پشتیبانی تماس بگیر.
							</span>
						</div>
						<div className="m-foot">
							<button type="button" className="btn btn-outline" onClick={onClose}>
								انصراف
							</button>
							<button type="submit" className={classNames("btn btn-primary", { loading: request.isPending })}>
								ارسال کدها <Icon name="arrow" />
							</button>
						</div>
					</form>
				)}
			</div>
		</Modal>
	);
}
