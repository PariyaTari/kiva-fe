/** Mirrors the backend auth / user contract (kiva-openapi.yml · Auth, Account). */
import { Cart } from "./cart.type";
import { PhotoMessengerChannel } from "./order.type";

export type Gender = "FEMALE" | "MALE" | "UNSPECIFIED";

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
	roles?: string[];
	createdAt?: string;
}

export interface AuthTokens {
	accessToken: string;
	refreshToken: string;
	tokenType: "Bearer";
	/** Seconds. */
	expiresIn: number;
	refreshExpiresIn?: number;
}

export interface AuthResponse extends AuthTokens {
	/** `true` → show the optional «دوست داری چی صدات کنیم؟» step. */
	isNewUser: boolean;
	user: User;
	/** The cart after the guest cart was merged in. */
	cart?: Cart | null;
}
