import { MediaAsset } from "@/types/catalog.type";
import { OrderDetail, OrderItem, RefundMethod } from "@/types/order.type";
import { ResultError } from "@/types/result";

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
/** Longest video `POST /me/uploads` takes (`VIDEO_TOO_LONG`). */
export const VIDEO_MAX_SEC = 60;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const VIDEO_TYPES = ["video/mp4"];
const MB = 1024 * 1024;

/** The tile texts of the design: «حجمش بیشتر از ۸ مگه» / «فرمتش پشتیبانی نمی‌شه». */
export const UPLOAD_TYPE_ERROR = "فرمتش پشتیبانی نمی‌شه";
export const sizeError = (isVideo: boolean) => (isVideo ? "حجمش بیشتر از ۵۰ مگه" : "حجمش بیشتر از ۸ مگه");
export const VIDEO_LENGTH_ERROR = "ویدیو بیشتر از ۶۰ ثانیه‌ست";

/** The tile text of a failed upload — the design's short lines, or the server's own for what the client can't check (e.g. a too small photo). */
export function uploadErrorText(e: ResultError, isVideo: boolean) {
	const fieldCode = e.errorDetails?.find((d) => d.field === "file")?.code;
	if (e.code === "UPLOAD_TOO_LARGE" || fieldCode === "UPLOAD_TOO_LARGE") return sizeError(isVideo);
	if (e.code === "UPLOAD_TYPE_NOT_ALLOWED" || fieldCode === "UPLOAD_TYPE_NOT_ALLOWED") return UPLOAD_TYPE_ERROR;
	if (fieldCode === "VIDEO_TOO_LONG") return VIDEO_LENGTH_ERROR;
	// 20 uploads an hour per shopper
	if (e.code === "RATE_LIMITED") return "سقف آپلود این ساعت پر شده";
	return e.errorDetails?.find((d) => d.field === "file")?.message ?? "آپلود نشد";
}

/** Checked before sending, like the API: jpg/png/webp up to 8MB, mp4 up to 50MB. `null` = fine. */
export function uploadProblem(file: File): string | null {
	const isVideo = VIDEO_TYPES.includes(file.type);
	if (!isVideo && !IMAGE_TYPES.includes(file.type)) return UPLOAD_TYPE_ERROR;
	if (file.size > (isVideo ? 50 : 8) * MB) return sizeError(isVideo);
	return null;
}

export const isVideoFile = (file: File) => VIDEO_TYPES.includes(file.type);

export const REFUND_METHODS: { key: RefundMethod; icon: string; title: string }[] = [
	{ key: "ORIGINAL_PAYMENT", icon: "card", title: "به همون کارت" },
	{ key: "BANK_TRANSFER", icon: "bank", title: "واریز به شماره شبا" },
];

/** An order takes one return request — another only after a rejection (contract 1.21.0). */
export const hasOpenReturn = (order: Pick<OrderDetail, "returns">) => !!order.returns?.some((r) => r.status !== "REJECTED");

/** How many of a line can be returned: all of it while the window is open and the order has no other return. */
export function returnableQuantity(order: OrderDetail, item: OrderItem, now: number) {
	if (!item.returnableUntil || new Date(item.returnableUntil).getTime() <= now || hasOpenReturn(order)) return 0;
	return item.quantity;
}

/** Last day of the return window of the order (latest `returnableUntil` of its lines). */
export function returnDeadline(order: OrderDetail) {
	const times = order.items.map((i) => (i.returnableUntil ? new Date(i.returnableUntil).getTime() : 0)).filter(Boolean);
	return times.length ? Math.max(...times) : null;
}
