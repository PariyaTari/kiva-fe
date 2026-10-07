"use client";

import Link from "next/link";
import classNames from "classnames";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Reveal from "@/app/_components/common/reveal/reveal";
import { Icon } from "@/app/_components/icon/icons";
import MediaImage from "@/app/_components/shop/mediaImage/mediaImage";
import { StockAlert, StockAlertStatus } from "@/types/stockAlert.type";
import { toPersianDigits } from "@/utils/digits";
import { formatDate } from "@/utils/format";
import { withMappedError } from "@/utils/withMappedError";
import { AccountEndpoints } from "../../_api/accountEndpoints";

const STATUS: Record<StockAlertStatus, { tag: string; label: string }> = {
	ACTIVE: { tag: "tag-warn", label: "منتظر موجود شدن" },
	NOTIFIED: { tag: "tag-success", label: "موجود شد" },
	CANCELLED: { tag: "", label: "لغو شده" },
};

type StockAlertCardProps = {
	alert: StockAlert;
	/** After the cancel went through — the panel offers «برگردون». */
	onCancelled: (alert: StockAlert) => void;
	delay?: number;
};

/** One «موجود شد خبرم کن» subscription: the bag, its colour, the state and «لغو» / «مشاهده و خرید». */
export default function StockAlertCard({ alert, onCancelled, delay }: StockAlertCardProps) {
	const queryClient = useQueryClient();
	const status = STATUS[alert.status] ?? STATUS.ACTIVE;
	const product = alert.product;
	const colorKey = alert.color?.key ?? product?.colorKey;
	const href = product ? `/product/${product.slug}${colorKey ? `?color=${colorKey}` : ""}` : null;

	const cancel = useMutation({
		mutationFn: () => withMappedError(() => AccountEndpoints.deleteStockAlert(alert.id)),
		meta: { showNotification: true },
		onSuccess: () => {
			onCancelled(alert);
			// returned: the button keeps its spinner until the card leaves the re-read list
			return queryClient.invalidateQueries({ queryKey: ["me", "stock-alerts"] });
		},
	});

	return (
		<Reveal className="my-rv st-alert" delay={delay}>
			<div className="h">
				<span className="th">
					<MediaImage src={product?.imageUrl} alt={product?.name} />
				</span>
				<span>
					{href ? (
						<Link href={href}>
							<b>{product?.name}</b>
						</Link>
					) : (
						<b>{product?.name}</b>
					)}
					<small>
						{alert.color ? (
							<>
								<i className="sw" style={{ background: alert.color.hex }} /> رنگ {alert.color.name}
							</>
						) : (
							"هر رنگی که موجود بشه"
						)}
						{alert.createdAt && ` · ثبت ${formatDate(alert.createdAt)}`}
					</small>
				</span>
				<span className={classNames("tag", status.tag)}>{status.label}</span>
			</div>

			<div className="al-foot">
				{alert.status === "NOTIFIED" ? (
					<p>
						<Icon name="bell" /> {alert.notifiedAt ? `${formatDate(alert.notifiedAt)} موجود شد` : "موجود شد"} و برات پیامک فرستادیم؛ تا تموم نشده سفارشش بده.
					</p>
				) : alert.status === "CANCELLED" ? (
					<p>این اطلاع‌رسانی لغو شده.</p>
				) : (
					<p>
						<Icon name="bell" /> {alert.message ?? "هر وقت موجود شد، بهت پیامک می‌دیم"}
						{/* its own bidi run — a masked LTR number inside RTL brackets comes out scrambled */}
						{alert.phoneMasked && (
							<span className="ph">
								پیامک به <span className="ltr">{toPersianDigits(alert.phoneMasked)}</span>
							</span>
						)}
					</p>
				)}
				<div className="acts">
					{alert.status === "NOTIFIED" && href && (
						<Link className="btn btn-primary btn-sm" href={href}>
							مشاهده و خرید
						</Link>
					)}
					{alert.status === "ACTIVE" && (
						<button
							type="button"
							className={classNames("btn btn-white btn-sm del", { loading: cancel.isPending })}
							disabled={cancel.isPending}
							aria-busy={cancel.isPending || undefined}
							onClick={() => cancel.mutate()}
						>
							لغو اطلاع‌رسانی
						</button>
					)}
				</div>
			</div>
		</Reveal>
	);
}
