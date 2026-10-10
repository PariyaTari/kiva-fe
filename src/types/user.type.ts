/** Mirrors the backend auth / user contract (kiva-openapi.yml · Auth, Account). */
import { Cart } from "./cart.type";
import { PhotoMessengerChannel } from "./order.type";

export type Gender = "FEMALE" | "MALE" | "UNSPECIFIED";

/** `CUSTOMER` for everyone; the rest are panel roles. */
export type UserRole = "CUSTOMER" | "ADMIN" | "CATALOG_MANAGER" | "OPERATOR" | "CONTENT_EDITOR" | "SUPPORT";

export interface User {
	id: number;
	phone: string;
	firstName?: string | null;
	lastName?: string | null;
	fullName?: string | null;
	/** «سلام سارا» or «دوست عزیز». */
	displayName?: string;
	avatarInitial?: string;
	email?: string | null;
	/** Gregorian `YYYY-MM-DD`; shown as Jalali on the client. */
	birthDate?: string | null;
	gender?: Gender;
	defaultMessenger?: PhotoMessengerChannel | null;
	defaultMessengerPhone?: string | null;
	marketingSmsOptIn?: boolean;
	roles?: UserRole[];
	createdAt?: string;
}

/** The refresh token is not here — it is the HttpOnly `kiva_rt` cookie (contract 1.4.0). */
export interface AuthTokens {
	accessToken: string;
	tokenType: "Bearer";
	/** Lifetime of the access token, seconds (15 minutes). */
	expiresIn: number;
	/** Lifetime of the session cookie, seconds — for information only. */
	refreshExpiresIn: number;
}

export interface AuthResponse extends AuthTokens {
	/** `true` → show the optional «دوست داری چی صدات کنیم؟» step. */
	isNewUser: boolean;
	user: User;
	/** The cart after the guest cart was merged in — always `null` until the backend's cart phase. */
	cart: Cart | null;
}

/** `POST /me/phone-change/verify` — a new session for this device (every other one ended). */
export interface PhoneChangeResponse extends AuthTokens {
	user: User;
}
