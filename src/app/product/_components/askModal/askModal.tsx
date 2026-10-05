"use client";

import { useQuery } from "@tanstack/react-query";
import ErrorComponent from "@/app/_components/common/errorComponent2/errorComponent2";
import Loading from "@/app/_components/common/loading/loading";
import { Icon } from "@/app/_components/icon/icons";
import { MessengerIcon } from "@/app/_components/icon/messengerIcon";
import Modal from "@/app/_components/ui/modal/modal";
import { ColorKey } from "@/types/catalog.type";
import { toErrorView } from "@/utils/apiError";
import { toPersianDigits } from "@/utils/digits";
import { withMappedError } from "@/utils/withMappedError";
import { ProductEndpoints } from "../../_api/productEndpoints";
import { ERROR_BEHAVIOUR } from "../../_utils/apiError";

type AskModalProps = {
	open: boolean;
	onClose: () => void;
	productId: number;
	color: ColorKey;
};

/** «عکس یا ویدیوی بیشتر می‌خوای؟» — messenger deep links with the product, colour and code prefilled (server-built). */
export default function AskModal({ open, onClose, productId, color }: AskModalProps) {
	const inquiry = useQuery({
		queryKey: ["product", productId, "inquiry", color],
		queryFn: () => withMappedError(() => ProductEndpoints.getInquiry(productId, color)),
		enabled: open,
	});

	const inquiryError = toErrorView(ERROR_BEHAVIOUR, inquiry.error, "دریافت لینک پیام‌رسان‌ها با خطا مواجه شد.");

	return (
		<Modal open={open} onClose={onClose} width={460}>
			<h3>عکس یا ویدیوی بیشتر می‌خوای؟</h3>
			<p className="muted" style={{ fontSize: 13.5 }}>
				پیام‌رسانت رو انتخاب کن؛ کد محصول و رنگ انتخابی خودکار توی پیام قرار می‌گیره و همکارهامون زود جواب می‌دن.
			</p>
			{inquiry.isLoading ? (
				<Loading />
			) : inquiryError ? (
				<div style={{ marginTop: 18 }}>
					<ErrorComponent
						retryable={inquiryError.retryable}
						ticketAble={inquiryError.ticketAble}
						errorText={inquiryError.errorText}
						executeFunction={() => inquiry.refetch()}
						loading={inquiry.isFetching}
					/>
				</div>
			) : inquiry.data ? (
				<>
					<div className="ask-list">
						{inquiry.data.channels.map((c) => (
							<a key={c.channel} href={c.url} target="_blank" rel="noopener">
								<MessengerIcon channel={c.channel} className="m" />
								<span>
									{c.name}
									{c.responseHours && <small>{c.responseHours}</small>}
								</span>
								<Icon name="left" className="go" />
							</a>
						))}
					</div>
					<div className="note" style={{ marginTop: 16 }}>
						<Icon name="info" />
						<span>
							{inquiry.data.productName} — رنگ {inquiry.data.colorName} — کد {toPersianDigits(inquiry.data.productCode)}
						</span>
					</div>
				</>
			) : null}
		</Modal>
	);
}
