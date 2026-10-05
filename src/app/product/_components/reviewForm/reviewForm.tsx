"use client";

import { Fragment, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Input from "@/app/_components/ui/input/input";
import Textarea from "@/app/_components/ui/textarea/textarea";
import { useForm, ValidationSchema } from "@/hooks/useForm";
import { mobileRegex } from "@/regex/mobileRegex";
import { toast } from "@/store/notification.store";
import { User } from "@/types/user.type";
import { convertPersianToEnglishString, toPersianDigits } from "@/utils/digits";
import { withMappedError } from "@/utils/withMappedError";
import { ProductEndpoints } from "../../_api/productEndpoints";

const STAR = "M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8L3.5 9.7l5.9-.9L12 3.5z";
const EMAIL = /^\S+@\S+\.\S+$/;

type ReviewValues = { rating: string; name: string; contact: string; text: string };

const SCHEMA: ValidationSchema<ReviewValues> = {
	contact: (v) => {
		const en = convertPersianToEnglishString(v).trim();
		return mobileRegex.test(en) || EMAIL.test(en) ? undefined : "شماره موبایل یا ایمیل معتبر وارد کن";
	},
	text: (v) => (v.trim().length >= 10 ? undefined : "حداقل ۱۰ حرف بنویس"),
};

type ReviewFormProps = {
	productId: number;
	user: User;
};

/** `.rv-form` — the review goes live after admin approval (it shows up as «در انتظار تأیید» for its author). */
export default function ReviewForm({ productId, user }: ReviewFormProps) {
	const queryClient = useQueryClient();
	const initialValues = useMemo<ReviewValues>(
		() => ({ rating: "5", name: user.fullName ?? user.firstName ?? "", contact: toPersianDigits(user.phone), text: "" }),
		[user],
	);

	const create = useMutation({
		mutationFn: (values: ReviewValues) =>
			withMappedError(() =>
				ProductEndpoints.createReview(productId, {
					rating: Number(values.rating),
					authorName: values.name.trim() || undefined,
					contact: convertPersianToEnglishString(values.contact).trim(),
					text: values.text.trim(),
				}),
			),
		meta: { showNotification: true },
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["product", productId, "reviews"] });
			toast("نظرت ثبت شد و بعد از تأیید نمایش داده می‌شه", { icon: "chat" });
		},
	});

	// a sent review starts the form over (the design redraws it empty)
	const form = useForm<ReviewValues>({ initialValues, validationSchema: SCHEMA, onSubmit: (values) => create.mutate(values, { onSuccess: () => form.reset() }) });

	return (
		<form className="rv-form" id="rvForm" noValidate onSubmit={form.handleSubmit}>
			<h4>نظرت رو بنویس</h4>
			<p className="muted" style={{ fontSize: 12.5, marginBottom: 12 }}>
				نظرت بعد از تأیید ادمین نمایش داده می‌شه.
			</p>
			<div className="rate-in" role="radiogroup" aria-label="امتیاز">
				{[5, 4, 3, 2, 1].map((s) => (
					// input + label stay siblings — the hover / checked colouring uses `~`
					<Fragment key={s}>
						<input type="radio" name="rating" id={`r${s}`} value={s} checked={form.values.rating === String(s)} onChange={form.handleChange} />
						<label htmlFor={`r${s}`} title={`${toPersianDigits(s)} ستاره`}>
							<svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
								<path d={STAR} />
							</svg>
						</label>
					</Fragment>
				))}
			</div>
			<Input wrapperStyle={{ marginTop: 12 }} id="rvName" label="نام" placeholder="مثلاً سارا" {...form.getFieldProps("name")} />
			<Input wrapperStyle={{ marginTop: 12 }} id="rvContact" label="شماره موبایل یا ایمیل" direction="ltr" {...form.getFieldProps("contact")} />
			<Textarea wrapperStyle={{ marginTop: 12 }} id="rvText" label="متن نظر" placeholder="از کیفیت، رنگ و اندازه بگو…" {...form.getFieldProps("text")} />
			<button type="submit" className="btn btn-primary btn-block" style={{ marginTop: 14 }} disabled={create.isPending}>
				ثبت نظر
			</button>
		</form>
	);
}
