"use client";

import { useState } from "react";
import classNames from "classnames";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import ErrorComponent from "@/app/_components/common/errorComponent2/errorComponent2";
import { Icon } from "@/app/_components/icon/icons";
import { MessengerIcon } from "@/app/_components/icon/messengerIcon";
import MediaImage from "@/app/_components/shop/mediaImage/mediaImage";
import { toast } from "@/store/notification.store";
import { OrderSummary } from "@/types/order.type";
import { toErrorView } from "@/utils/apiError";
import { toPersianDigits } from "@/utils/digits";
import { withMappedError } from "@/utils/withMappedError";
import { AccountEndpoints } from "../../_api/accountEndpoints";
import { ERROR_BEHAVIOUR, isTooLateError } from "../../_utils/apiError";
import { clockTime, dayLong, dayShort, itemsLabel } from "../../_utils/orderActions";
import MediaLightbox from "../mediaLightbox/mediaLightbox";

/** Which `.pc` box an order shows: waiting for «همونه؟», approved, or a change requested. */
export type PhotoCheckState = "ask" | "ok" | "chg";

export function photoCheckState(order: OrderSummary): PhotoCheckState | null {
	if (order.status === "CHANGE_REQUESTED" || order.preShipmentMedia?.status === "CHANGE_REQUESTED") return "chg";
	if (order.status !== "PHOTO_SENT") return null;
	if (order.preShipmentMedia?.status === "APPROVED") return "ok";
	return order.actions?.canApproveMedia ? "ask" : null;
}

const THUMBS = 4;

type PhotoCheckProps = {
	order: OrderSummary;
	state: PhotoCheckState;
	onRequestChange: () => void;
};

/**
 * `.pc` «عکس‌های کیفت رسید! همونیه که می‌خواستی؟» — the KIVA signature on the card: one-click approve
 * (also from the lightbox), or a change request; after the answer, the green / cream variant.
 */
export default function PhotoCheck({ order, state, onRequestChange }: PhotoCheckProps) {
	const queryClient = useQueryClient();
	const [lightbox, setLightbox] = useState({ open: false, index: 0 });
	const summary = order.preShipmentMedia;
	const channel = summary?.channel;
	const channelName = summary?.channelName ?? "";

	// thumbnails, the answer deadline and the shopper's answer — not part of the order list
	const media = useQuery({
		queryKey: ["me", "orders", "media", order.code],
		queryFn: () => withMappedError(() => AccountEndpoints.getOrderMedia(order.code)),
		meta: { showNotificationOnRefetch: true },
	});

	const approve = useMutation({
		mutationFn: () => withMappedError(() => AccountEndpoints.sendMediaFeedback(order.code, { decision: "APPROVE" })),
		onSuccess: () => {
			setLightbox((l) => ({ ...l, open: false }));
			queryClient.invalidateQueries({ queryKey: ["me", "orders"] });
			queryClient.invalidateQueries({ queryKey: ["me", "dashboard"] });
			toast("ممنون! کیفت برای ارسال آماده می‌شه", { icon: "check" });
		},
		onError: (e) => {
			// shipped meanwhile — the card catches up
			if (isTooLateError(e)) queryClient.invalidateQueries({ queryKey: ["me", "orders"] });
			toast(e.description, { type: "error" });
		},
	});

	const shots = media.data?.items ?? [];
	const deadline = media.data?.feedbackDeadline;
	const feedback = media.data?.feedback;
	const canChange = !!order.actions?.canRequestChange;
	const mediaError = toErrorView(ERROR_BEHAVIOUR, media.error, "دریافت عکس‌های کیف با خطا مواجه شد.");
	const errorBar = !!mediaError && (
		<ErrorComponent
			retryable={mediaError.retryable}
			ticketAble={mediaError.ticketAble}
			errorText={mediaError.errorText}
			executeFunction={() => media.refetch()}
			variant="text"
			height={56}
			loading={media.isFetching}
		/>
	);

	if (state === "ok")
		return (
			<div className="pc ok">
				<span className="ribbon">
					<Icon name="check" /> تأیید شد
				</span>
				<div className="pc-h">
					<span className="pi">
						<Icon name="check" />
					</span>
					<span>
						<b>تأییدش کردی؛ کیفت برای ارسال آماده می‌شه</b>
						<small>
							{feedback?.at ? `تأیید: ${dayLong(feedback.at)}، ساعت ${clockTime(feedback.at)} · ` : ""}ارسال با {order.shippingMethod.name}
						</small>
					</span>
				</div>
				{errorBar}
			</div>
		);

	if (state === "chg")
		return (
			<div className="pc chg">
				<span className="ribbon">
					<Icon name="swap" /> درخواست تغییر
				</span>
				<div className="pc-h">
					<span className="pi">
						<Icon name="swap" />
					</span>
					<span>
						<b>درخواست تغییرت ثبت شد</b>
						<small>
							{channel && <MessengerIcon channel={channel} />} اپراتور توی {channelName} باهات هماهنگ می‌کنه؛ عکس کیف جدید رو هم قبل از ارسال می‌بینی.
						</small>
					</span>
				</div>
				<div className="req">
					<div className="req-line">
						<span className="lbl">کیف</span>
						<b>{itemsLabel(order)}</b>
						{feedback?.at && (
							<span className="muted" style={{ fontSize: 12.5 }}>
								— ثبت: {dayShort(feedback.at)}، ساعت {clockTime(feedback.at)}
							</span>
						)}
					</div>
					{feedback?.note && <div className="req-q">{feedback.note}</div>}
					{errorBar}
				</div>
			</div>
		);

	const sentAt = summary?.sentAt ?? media.data?.sentAt;

	return (
		<div className="pc">
			<span className="ribbon">
				<Icon name="sparkle" /> امضای کیوا
			</span>
			<div className="pc-h">
				<span className="pi">
					<Icon name="camera" />
				</span>
				<span>
					<b>عکس‌های کیفت رسید! همونیه که می‌خواستی؟</b>
					<small>
						{channel && <MessengerIcon channel={channel} />} توی {channelName} هم برات فرستادیم{sentAt ? ` — ${dayLong(sentAt)}` : ""}
					</small>
				</span>
			</div>
			<div className="pc-th">
				{errorBar ||
					shots.slice(0, THUMBS).map((m, i) =>
						m.type === "VIDEO" ? (
							<button key={m.id} type="button" className="v" aria-label="ویدیو" onClick={() => setLightbox({ open: true, index: i })}>
								<MediaImage src={m.thumbnailUrl ?? m.posterUrl} alt={m.alt} />
								<span className="pl">
									<Icon name="play" />
								</span>
							</button>
						) : (
							<button key={m.id} type="button" aria-label={`عکس ${toPersianDigits(i + 1)}`} onClick={() => setLightbox({ open: true, index: i })}>
								<MediaImage src={m.thumbnailUrl ?? m.url} alt={m.alt} />
							</button>
						),
					)}
				{!errorBar && shots.length > THUMBS && (
					<button type="button" className="more" onClick={() => setLightbox({ open: true, index: THUMBS })}>
						+{toPersianDigits(shots.length - THUMBS)}
					</button>
				)}
			</div>
			<div className="pc-f">
				{deadline && (
					<span className="dl">
						<Icon name="clock" />
						<span>
							اگه تا {dayLong(deadline)}، ساعت {clockTime(deadline)} جوابی ندی، تأییدشده حساب می‌شه و ارسالش می‌کنیم.
						</span>
					</span>
				)}
				{/* without a deadline the buttons keep their place at the end */}
				<span className="go" style={deadline ? undefined : { marginInlineStart: "auto" }}>
					{canChange && (
						<button type="button" className="btn btn-white btn-sm" onClick={onRequestChange}>
							<Icon name="swap" /> می‌خوام عوضش کنم
						</button>
					)}
					<button type="button" className={classNames("btn btn-primary btn-sm", { loading: approve.isPending })} onClick={() => approve.mutate()}>
						<Icon name="check" /> همونه! ارسالش کن
					</button>
				</span>
			</div>
			{!!shots.length && (
				<MediaLightbox
					open={lightbox.open}
					onClose={() => setLightbox((l) => ({ ...l, open: false }))}
					items={shots}
					index={lightbox.index}
					onIndex={(index) => setLightbox({ open: true, index })}
					caption={`${itemsLabel(order)} · سفارش ${order.code}`}
					decide={{
						deadline,
						canChange,
						approving: approve.isPending,
						onApprove: () => approve.mutate(),
						onChange: () => {
							setLightbox((l) => ({ ...l, open: false }));
							onRequestChange();
						},
					}}
				/>
			)}
		</div>
	);
}
