/** Mirrors `SiteConfig` (`GET /config`) — everything the shell (header, footer, drawers) needs. */
import { IconName, Money, Perk } from "./catalog.type";
import { ShippingMethodCode } from "./cart.type";
import { MessengerOption, PaymentGatewayCode, SocialChannel } from "./order.type";

export interface Announcement {
	id: number;
	icon: IconName;
	text: string;
	url?: string | null;
	sortOrder?: number;
}

export interface SupportHours {
	label: string;
	weekdays?: string[];
	from?: string | null;
	to?: string | null;
	messengerOnly?: boolean;
}

export interface SocialLink {
	channel: SocialChannel;
	name: string;
	url: string;
	handle?: string;
}

export interface ShippingMethod {
	code: ShippingMethodCode;
	name: string;
	description?: string;
	baseCost: Money;
	minDays?: number;
	maxDays?: number;
	icon?: IconName;
	trackingUrlTemplate?: string;
	isActive?: boolean;
}

export interface PaymentGateway {
	code: PaymentGatewayCode;
	name: string;
	logoUrl?: string | null;
	brandColor?: string;
	initial?: string;
	isDefault?: boolean;
	available?: boolean;
}

export interface FooterLinkGroup {
	group: string;
	links: { label: string; url: string }[];
}

export interface TrustBadge {
	type: "ENAMAD" | "SAMANDEHI";
	label: string;
	imageUrl?: string;
	linkUrl?: string;
}

export interface SiteConfig {
	brand?: {
		name: string;
		slogan: string;
		about?: string;
		logoUrl?: string;
		logoWhiteUrl?: string;
		faviconUrl?: string;
	};
	currency?: { code: "IRT"; label: string };
	announcements?: Announcement[];
	shipping?: {
		methods: ShippingMethod[];
		freeShippingThreshold: Money;
		freeShippingMethods?: ShippingMethodCode[];
		nonShippingWeekdays?: string[];
	};
	reservation?: { enabled: boolean; holdDays: number; description?: string };
	returns?: { windowDays: number; policyUrl?: string };
	preShipmentPhoto?: {
		enabled: boolean;
		required: boolean;
		channels: MessengerOption[];
		title?: string;
		description?: string;
	};
	inventory?: { lowStockThreshold: number };
	auth?: { otpLength: number; resendCooldownSeconds: number };
	support?: {
		phone: string;
		phoneDisplay: string;
		email: string;
		emailResponseHint?: string;
		responseTimeHint?: string;
		hours?: SupportHours[];
		isOpenNow?: boolean;
	};
	social?: SocialLink[];
	paymentGateways?: PaymentGateway[];
	productPerks?: Perk[];
	trustBadges?: TrustBadge[];
	footerLinks?: FooterLinkGroup[];
	features?: Record<string, boolean>;
}
