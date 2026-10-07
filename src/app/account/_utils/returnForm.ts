import { MediaAsset } from "@/types/catalog.type";
import { OrderDetail, OrderItem, RefundMethod } from "@/types/order.type";
import { convertPersianToEnglishString, toPersianDigits } from "@/utils/digits";

/** One photo / video tile of the return form (`POST /me/uploads`). */
export interface UploadTile {
	id: string;
	file: File;
	/** Object URL of the local file (revoked when the tile goes). */
	previewUrl: string;
	isVideo: boolean;
	status: "busy" | "ok" | "err";
	progress: number;
	error?: string;
	asset?: MediaAsset;
	/** Stops the upload when the tile is removed. */
	controller?: AbortController;
	durationSec?: number;
}

export const MAX_UPLOADS = 6;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const VIDEO_TYPES = ["video/mp4"];
const MB = 1024 * 1024;

/** The tile texts of the design: «حجمش بیشتر از ۸ مگه» / «فرمتش پشتیبانی نمی‌شه». */
export const UPLOAD_TYPE_ERROR = "فرمتش پشتیبانی نمی‌شه";
export const sizeError = (isVideo: boolean) => (isVideo ? "حجمش بیشتر از ۵۰ مگه" : "حجمش بیشتر از ۸ مگه");

/** Checked before sending, like the API: jpg/png/webp up to 8MB, mp4 up to 50MB. `null` = fine. */
export function uploadProblem(file: File): string | null {
	const isVideo = VIDEO_TYPES.includes(file.type);
	if (!isVideo && !IMAGE_TYPES.includes(file.type)) return UPLOAD_TYPE_ERROR;
	if (file.size > (isVideo ? 50 : 8) * MB) return sizeError(isVideo);
	return null;
}

export const isVideoFile = (file: File) => VIDEO_TYPES.includes(file.type);

/** `06017000000012345…` → «۰۶ ۰۱۷۰ ۰۰۰۰ ۰۰۱۲ ۳۴۵…» (the 24 digits after `IR`). */
export function formatIban(digits: string) {
	return toPersianDigits(`${digits.slice(0, 2)} ${(digits.slice(2).match(/.{1,4}/g) ?? []).join(" ")}`.trim());
}

/** What the shopper typed in the IBAN box → up to 24 Latin digits. */
export const ibanDigits = (value: string) => convertPersianToEnglishString(value).replace(/\D/g, "").slice(0, 24);

export const REFUND_METHODS: { key: RefundMethod; icon: string; title: string }[] = [
	{ key: "ORIGINAL_PAYMENT", icon: "card", title: "به همون کارت" },
	{ key: "BANK_TRANSFER", icon: "bank", title: "واریز به شماره شبا" },
	{ key: "STORE_CREDIT", icon: "wallet", title: "اعتبار خرید در کیوا" },
];

/** How many of a line can still be returned (requests that weren't rejected already hold some). */
export function returnableQuantity(order: OrderDetail, item: OrderItem, now: number) {
	if (!item.returnableUntil || new Date(item.returnableUntil).getTime() <= now) return 0;
	const held = (order.returns ?? [])
		.filter((r) => r.status !== "REJECTED")
		.flatMap((r) => r.items)
		.filter((i) => i.orderItemId === item.id)
		.reduce((n, i) => n + i.quantity, 0);
	return Math.max(0, item.quantity - held);
}

/** Last day of the return window of the order (latest `returnableUntil` of its lines). */
export function returnDeadline(order: OrderDetail) {
	const times = order.items.map((i) => (i.returnableUntil ? new Date(i.returnableUntil).getTime() : 0)).filter(Boolean);
	return times.length ? Math.max(...times) : null;
}
