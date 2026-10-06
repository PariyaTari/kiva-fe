"use client";

import { FormEvent, useState } from "react";
import classNames from "classnames";
import { useMutation, useQuery } from "@tanstack/react-query";
import ErrorComponent from "@/app/_components/common/errorComponent2/errorComponent2";
import Loading from "@/app/_components/common/loading/loading";
import Reveal from "@/app/_components/common/reveal/reveal";
import { Icon } from "@/app/_components/icon/icons";
import Input from "@/app/_components/ui/input/input";
import Textarea from "@/app/_components/ui/textarea/textarea";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "@/store/notification.store";
import { toErrorView } from "@/utils/apiError";
import { convertPersianToEnglishString, digitsOnly, toPersianDigits } from "@/utils/digits";
import { withMappedError } from "@/utils/withMappedError";
import { ContactEndpoints } from "../../_api/contactEndpoints";
import { ContactMessagePayload, ContactTopic } from "../../_types/contact.type";
import { ERROR_BEHAVIOUR } from "../../_utils/apiError";

const MAX = 600;
type Field = "fullName" | "phone" | "message";
const FIELD_IDS: Record<Field, string> = { fullName: "cName", phone: "cPh", message: "cMsg" };

/** `.c-form#formWrap` «برامون بنویس» — topic chips, name / mobile (prefilled for members), order code when it matters, message. */
export default function ContactForm({ initialTopic }: { initialTopic?: string }) {
	const user = useAuthStore((s) => s.user);
	// `null` = not edited yet → the signed-in shopper's own details
	const [topicPick, setTopicPick] = useState<string | null>(initialTopic ?? null);
	const [name, setName] = useState<string | null>(null);
	const [phone, setPhone] = useState<string | null>(null);
	const [orderCode, setOrderCode] = useState("");
	const [message, setMessage] = useState("");
	const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
	const [sent, setSent] = useState<{ ticketCode: string; name: string } | null>(null);

	const topics = useQuery({
		queryKey: ["contact", "topics"],
		queryFn: () => withMappedError(() => ContactEndpoints.getTopics()),
		meta: { showNotificationOnRefetch: true },
	});

	const fullName = name ?? (user?.fullName || [user?.firstName, user?.lastName].filter(Boolean).join(" "));
	const mobile = phone ?? user?.phone ?? "";
	const topic = topics.data?.find((t) => t.value === topicPick) ?? topics.data?.[0];

	const send = useMutation({
		mutationFn: (payload: ContactMessagePayload) => withMappedError(() => ContactEndpoints.sendMessage(payload)),
		onSuccess: (res, payload) => setSent({ ticketCode: res.ticketCode, name: payload.fullName }),
		// field answers go back on the fields; anything else (rate limit, network) is a toast
		onError: (e) => {
			const fieldErrors: Partial<Record<Field, string>> = {};
			e.errorDetails?.forEach((d) => {
				if (d.field === "fullName" || d.field === "phone" || d.field === "message") fieldErrors[d.field] = d.message;
			});
			if (Object.keys(fieldErrors).length) setErrors(fieldErrors);
			else toast(e.description, { type: "error" });
		},
	});

	const clearError = (field: Field) => setErrors((x) => ({ ...x, [field]: undefined }));

	const submit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!topic) return;
		const next: Partial<Record<Field, string>> = {
			fullName: fullName.trim().length < 3 ? "نامت رو وارد کن" : undefined,
			phone: /^09\d{9}$/.test(mobile) ? undefined : "موبایل ۱۱ رقمی وارد کن",
			message: message.trim().length < 10 ? "حداقل ۱۰ حرف بنویس" : undefined,
		};
		setErrors(next);
		const first = (Object.keys(FIELD_IDS) as Field[]).find((f) => next[f]);
		if (first) return document.getElementById(FIELD_IDS[first])?.focus();
		const code = convertPersianToEnglishString(orderCode).trim().toUpperCase();
		send.mutate({
			topic: topic.value as ContactTopic,
			fullName: fullName.trim(),
			phone: mobile,
			orderCode: topic.requiresOrderCode && code ? code : null,
			message: message.trim(),
		});
	};

	const startOver = () => {
		setSent(null);
		setMessage("");
		setOrderCode("");
	};

	const topicsError = toErrorView(ERROR_BEHAVIOUR, topics.error, "دریافت موضوعات با خطا مواجه شد.");

	return (
		<Reveal className="c-form" id="formWrap">
			{sent ? (
				<div className="sent">
					<div className="ck">
						<Icon name="check" />
					</div>
					<h2 style={{ fontSize: 22 }}>پیامت رسید!</h2>
					<p className="muted" style={{ margin: "8px 0 20px" }}>
						ممنون {sent.name} جان. کد پیگیری: <b>{toPersianDigits(sent.ticketCode)}</b>
						<br />
						به زودی از طریق پیامک باهات تماس می‌گیریم.
					</p>
					<button type="button" className="btn btn-outline" onClick={startOver}>
						ارسال پیام جدید
					</button>
				</div>
			) : (
				<>
					<h2>برامون بنویس</h2>
					<p>فرم رو پر کن؛ همکارهامون از طریق پیامک یا ایمیل باهات تماس می‌گیرن.</p>
					<form id="cf" noValidate onSubmit={submit}>
						<div className="field" style={{ marginBottom: 18 }}>
							<label>موضوع</label>
							{topics.isLoading ? (
								<Loading />
							) : !!topicsError ? (
								<ErrorComponent
									retryable={topicsError.retryable}
									ticketAble={topicsError.ticketAble}
									errorText={topicsError.errorText}
									executeFunction={() => topics.refetch()}
									height={56}
									loading={topics.isFetching}
								/>
							) : (
								<div className="topics">
									{topics.data?.map((t) => (
										<label key={t.value}>
											<input type="radio" name="topic" value={t.value} checked={topic?.value === t.value} onChange={() => setTopicPick(t.value)} />
											<span>{t.label}</span>
										</label>
									))}
								</div>
							)}
						</div>
						<div className="form-grid">
							<Input
								id="cName"
								wrapperId="fName"
								label="نام و نام خانوادگی"
								autoComplete="name"
								maxLength={80}
								value={fullName}
								error={errors.fullName}
								onChange={(e) => {
									setName(e.target.value);
									clearError("fullName");
								}}
							/>
							<Input
								id="cPh"
								wrapperId="fPh"
								label="شماره موبایل"
								direction="ltr"
								inputMode="numeric"
								maxLength={11}
								placeholder="۰۹۱۲۳۴۵۶۷۸۹"
								value={toPersianDigits(mobile)}
								error={errors.phone}
								onChange={(e) => {
									setPhone(digitsOnly(e.target.value, 11).en);
									clearError("phone");
								}}
							/>
							{topic?.requiresOrderCode && (
								<Input
									id="cOrd"
									wrapperId="fOrd"
									wrapperClassName="full"
									label="شماره سفارش"
									labelNote="اختیاری"
									direction="ltr"
									placeholder="KV-215566"
									maxLength={20}
									value={orderCode}
									onChange={(e) => setOrderCode(e.target.value)}
								/>
							)}
							<Textarea
								id="cMsg"
								wrapperId="fMsg"
								wrapperClassName="full"
								label="پیامت"
								maxLength={MAX}
								placeholder="هر چی می‌خوای بپرسی رو این‌جا بنویس…"
								value={message}
								error={errors.message}
								footer={
									<span className="counter" id="cnt">
										{toPersianDigits(message.length)} / {toPersianDigits(MAX)}
									</span>
								}
								onChange={(e) => {
									setMessage(e.target.value);
									clearError("message");
								}}
							/>
						</div>
						<button type="submit" className={classNames("btn btn-primary btn-lg", { loading: send.isPending })} style={{ marginTop: 20 }} id="cBtn">
							<Icon name="send" /> ارسال پیام
						</button>
					</form>
				</>
			)}
		</Reveal>
	);
}
