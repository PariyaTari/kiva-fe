/** Mirrors the backend public tracking contract (kiva-openapi.yml · Tracking). */
import { ShippingMethodCode } from "@/types/cart.type";
import { MediaAsset, Tone } from "@/types/catalog.type";
import { OrderCode, OrderProgress, OrderStatus, Shipment } from "@/types/order.type";
import { PageMeta } from "@/types/pageinate";

export interface GuestTrackingPayload {
	/** «KV-215566» or just the digits — the server adds the prefix. */
	orderCode: string;
	phone: string;
}

/** A trimmed order for guests: no address or prices, at most four preview photos. */
export interface GuestTrackingResult {
	code: OrderCode;
	placedAt: string;
	shippingMethod: { code: ShippingMethodCode; name: string };
	status: OrderStatus;
	statusLabel: string;
	statusTone?: Tone;
	progress: OrderProgress;
	shipment?: Shipment;
	preShipmentMedia?: { channelName: string; preview: MediaAsset[]; totalCount?: number } | null;
	loginHint?: string;
}

/** A day tab of «کدهای رهگیری ۱۰ روز اخیر». */
export interface DailyShipmentDay {
	date: string;
	/** «امروز» / «دیروز» / weekday. */
	label: string;
	shipmentCount: number;
	/** Fridays. */
	isNonShippingDay?: boolean;
}

/** Always masked by the server (`س*** م***`, `09** *** 4821`). */
export interface DailyShipmentEntry {
	id: number;
	recipientMasked: string;
	recipientInitial: string;
	city: string;
	carrier: ShippingMethodCode;
	carrierName: string;
	phoneLast4: string;
	phoneMasked: string;
	trackingCode: string;
	trackingUrl?: string;
	shippedAt?: string;
}

export interface DailyShipmentList {
	date: string;
	/** «یکشنبه ۱۳ مهر ۱۴۰۵». */
	label: string;
	isNonShippingDay?: boolean;
	/** «جمعه‌ها ارسال نداریم» / «موردی پیدا نشد…». */
	emptyMessage?: string | null;
	items: DailyShipmentEntry[];
	meta?: PageMeta;
}
