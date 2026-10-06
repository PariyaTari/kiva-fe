/** Mirrors the backend account contract (kiva-openapi.yml · Account, Orders, Reviews). */
import { ShippingMethodCode } from "@/types/cart.type";
import { OrderCode, OrderSummary, PhotoMessengerChannel, ReservationInfo } from "@/types/order.type";
import { PageMeta } from "@/types/pageinate";
import { Review } from "@/types/review.type";
import { Gender, User } from "@/types/user.type";

/** `PATCH /me` — only the fields sent change; `null` clears an optional field. */
export interface UpdateProfilePayload {
	firstName?: string | null;
	lastName?: string | null;
	email?: string | null;
	/** Gregorian `YYYY-MM-DD`. */
	birthDate?: string | null;
	gender?: Gender;
	defaultMessenger?: PhotoMessengerChannel | null;
	defaultMessengerPhone?: string | null;
	marketingSmsOptIn?: boolean;
}

/** Header of the account — greeting, the four stat cards and the side-menu counters. */
export interface AccountDashboard {
	greeting?: string;
	user?: User;
	stats?: {
		ordersTotal: number;
		ordersActive: number;
		mediaReceived: number;
		wishlistCount: number;
	};
	navCounts?: {
		orders: number;
		addresses: number;
		wishlist: number;
		reviews: number;
	};
	activeReservation?: ReservationInfo | null;
	pendingReviewCount?: number;
}

/** Tabs of «سفارش‌های من». */
export type OrderListFilter = "all" | "current" | "delivered" | "cancelled";

export interface OrderListResponse {
	items: OrderSummary[];
	meta: PageMeta;
	/** Counters of the filter tabs. */
	counts?: Partial<Record<OrderListFilter, number>>;
}

/** «کدهای رهگیری من» — shipments grouped by the day they left. */
export interface TrackingDayGroup {
	date: string;
	/** «سه‌شنبه ۸ مهر». */
	label: string;
	shipments: {
		orderCode: OrderCode;
		carrier: ShippingMethodCode;
		carrierName: string;
		trackingCode: string;
		trackingUrl?: string;
	}[];
}

export interface MyReviewListResponse {
	items: Review[];
	meta: PageMeta;
	counts?: { total: number; pending: number; approved: number };
}
