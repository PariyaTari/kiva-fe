"use client";

import { useQuery } from "@tanstack/react-query";
import { ProductEndpoints } from "@/app/product/_api/productEndpoints";
import { Icon } from "@/app/_components/icon/icons";
import { MediaFeedback, OrderSummary } from "@/types/order.type";
import { withMappedError } from "@/utils/withMappedError";
import { AccountEndpoints } from "../../_api/accountEndpoints";
import { clockTime, dayShort, itemsLabel } from "../../_utils/orderActions";

type ChangeRequestLinesProps = {
	order: OrderSummary;
	/** The shopper's `REQUEST_CHANGE` (`PreShipmentMedia.feedback`). */
	feedback?: MediaFeedback | null;
};

/**
 * `.req-line`s of a change request: which bag, what instead (colour from → to, another model, drop it)
 * and the shopper's note. Both reads only name things — without them the lines fall back to the order's label.
 */
export default function ChangeRequestLines({ order, feedback }: ChangeRequestLinesProps) {
	// the bag the request is about — `OrderSummary` items carry no id
	const detail = useQuery({
		queryKey: ["me", "orders", "detail", order.code],
		queryFn: () => withMappedError(() => AccountEndpoints.getOrder(order.code)),
		enabled: feedback?.orderItemId != null,
	});
	const item = detail.data?.items.find((i) => i.id === feedback?.orderItemId);

	// the colour asked for — same key as the change request modal and the product page
	const product = useQuery({
		queryKey: ["product", "detail", String(item?.productId)],
		queryFn: () => withMappedError(() => ProductEndpoints.getProduct(String(item?.productId))),
		enabled: feedback?.changeType === "COLOR" && !!feedback.desiredVariantId && !!item,
	});
	const desired = product.data?.variants.find((v) => v.id === feedback?.desiredVariantId)?.color;

	return (
		<>
			<div className="req-line">
				<span className="lbl">کیف</span>
				<b>{item?.name ?? itemsLabel(order)}</b>
				{feedback?.at && (
					<span className="muted" style={{ fontSize: 12.5 }}>
						— ثبت: {dayShort(feedback.at)}، ساعت {clockTime(feedback.at)}
					</span>
				)}
			</div>
			{feedback?.changeType === "COLOR" ? (
				<div className="req-line">
					<span className="lbl">رنگ</span>
					{item && (
						<>
							<span className="from">
								<span className="swatch-dot" style={{ background: item.color.hex }} /> {item.color.name}
							</span>
							<Icon name="arrow" />
						</>
					)}
					<span className="to">
						{desired ? (
							<>
								<span className="swatch-dot" style={{ background: desired.hex }} /> {desired.name}
							</>
						) : (
							"رنگ دیگه"
						)}
					</span>
				</div>
			) : feedback?.changeType === "MODEL" ? (
				<div className="req-line">
					<span className="lbl">درخواست</span>
					<span>یه مدل دیگه به‌جای این کیف</span>
				</div>
			) : feedback?.changeType === "CANCEL_ITEM" ? (
				<div className="req-line">
					<span className="lbl">درخواست</span>
					<span>حذف این کیف؛ بقیه‌ی سفارش ارسال بشه</span>
				</div>
			) : null}
			{feedback?.note && <div className="req-q">{feedback.note}</div>}
		</>
	);
}
