"use client";

import { useMemo } from "react";
import classNames from "classnames";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import StarInput from "@/app/_components/shop/starInput/starInput";
import Input from "@/app/_components/ui/input/input";
import Textarea from "@/app/_components/ui/textarea/textarea";
import { useForm, ValidationSchema } from "@/hooks/useForm";
import { toast } from "@/store/notification.store";
import { Review } from "@/types/review.type";
import { toPersianDigits } from "@/utils/digits";
import { withMappedError } from "@/utils/withMappedError";
import { AccountEndpoints } from "../../_api/accountEndpoints";
import { isReviewMovedOnError } from "../../_utils/apiError";
import ModalHead from "../modalHead/modalHead";

/** `UpdateReviewRequest` = the rules of a new review: name up to 40, text 10 to 1000 after trim. */
const NAME_MAX = 40;
const TEXT_MAX = 1000;
/** The name the server puts in when none was given — the field starts empty for it. */
const ANONYMOUS = "کاربر کیوا";

type EditValues = { rating: string; name: string; text: string };

const SCHEMA: ValidationSchema<EditValues> = {
	text: (v) => (v.trim().length < 10 ? "حداقل ۱۰ حرف بنویس" : v.trim().length > TEXT_MAX ? `حداکثر ${toPersianDigits(TEXT_MAX)} حرف` : undefined),
};

type ReviewEditModalBodyProps = {
	review: Review;
	onClose: () => void;
};

/**
 * «ویرایش نظر» of «نظرات من» (`PATCH /me/reviews/{id}`; not in the design — the product page's review form in the panel's
 * modal). Only a pending or rejected review; a rejected one goes back to review. The contact isn't shown or sent: the review
 * doesn't return it, and a field left out stays as it is.
 */
export default function ReviewEditModalBody({ review, onClose }: ReviewEditModalBodyProps) {
	const queryClient = useQueryClient();
	const rejected = review.status === "REJECTED";
	const initialValues = useMemo<EditValues>(
		() => ({ rating: String(review.rating), name: review.authorName === ANONYMOUS ? "" : review.authorName, text: review.text }),
		[review],
	);

	const save = useMutation({
		mutationFn: (values: EditValues) =>
			withMappedError(() =>
				AccountEndpoints.updateReview(review.id, { rating: Number(values.rating), authorName: values.name.trim(), text: values.text.trim() }),
			),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["me", "reviews"] });
			toast(rejected ? "نظرت دوباره برای بررسی فرستاده شد" : "نظرت ویرایش شد؛ بعد از تأیید نمایش داده می‌شه", { icon: "chat" });
			onClose();
		},
		onError: (e) => {
			// approved or deleted meanwhile (another tab, the panel) — the list shows where it stands now
			if (isReviewMovedOnError(e)) {
				queryClient.invalidateQueries({ queryKey: ["me", "reviews"] });
				onClose();
			}
			// `409`: a rejected review while another live one of this bag exists; a field the client checks didn't cover
			toast(e.errorDetails?.[0]?.message ?? e.description, { type: isReviewMovedOnError(e) ? "warning" : "error", duration: 6000 });
		},
	});

	const form = useForm<EditValues>({ initialValues, validationSchema: SCHEMA, onSubmit: (values) => save.mutate(values) });

	return (
		<form noValidate onSubmit={form.handleSubmit}>
			<ModalHead
				icon="edit"
				title="ویرایش نظر"
				sub={
					rejected
						? `${review.product?.name ?? "این کیف"} — بعد از ویرایش دوباره بررسی می‌شه.`
						: `${review.product?.name ?? "این کیف"} — هنوز منتشر نشده؛ تا تأیید می‌تونی عوضش کنی.`
				}
			/>
			{rejected && review.rejectionReason && (
				<div className="note danger" style={{ marginBottom: 14 }}>
					<span>
						<b>دلیل رد:</b> {review.rejectionReason}
					</span>
				</div>
			)}
			<StarInput value={form.values.rating} onChange={form.handleChange} idPrefix="er" />
			<Input
				wrapperStyle={{ marginTop: 12 }}
				id="erName"
				label="نام"
				labelNote="اختیاری"
				placeholder="خالی بذاری «کاربر کیوا» نوشته می‌شه"
				maxLength={NAME_MAX}
				{...form.getFieldProps("name")}
			/>
			<Textarea wrapperStyle={{ marginTop: 12 }} id="erText" label="متن نظر" maxLength={TEXT_MAX} {...form.getFieldProps("text")} />
			<div className="m-foot">
				<button type="button" className="btn btn-outline" onClick={onClose}>
					منصرف شدم
				</button>
				<button type="submit" className={classNames("btn btn-primary", { loading: save.isPending })} disabled={save.isPending}>
					{rejected ? "ویرایش و ارسال دوباره" : "ذخیره‌ی تغییرات"}
				</button>
			</div>
		</form>
	);
}
