/** Mirrors the backend address / geo contract (kiva-openapi.yml · Addresses). */

export interface City {
	id: number;
	name: string;
	provinceId?: number;
}

export interface Province {
	id: number;
	name: string;
	/** `null` when asked with `includeCities=false`. */
	cities?: City[] | null;
}

export interface Address {
	id: number;
	title?: string | null;
	provinceId: number;
	provinceName: string;
	cityId: number;
	cityName: string;
	addressLine: string;
	plaque?: string | null;
	unit?: string | null;
	postalCode: string;
	recipientName: string;
	recipientPhone: string;
	isSelfRecipient?: boolean;
	isDefault: boolean;
	/** «استان، شهر، آدرس»، plus «پلاک …» / «واحد …» when given. */
	fullText?: string;
	createdAt?: string;
}

export interface AddressInput {
	title?: string | null;
	provinceId: number;
	cityId: number;
	addressLine: string;
	postalCode: string;
	recipientName: string;
	recipientPhone: string;
	isSelfRecipient?: boolean;
	/** `true` makes it the default; `false` never unsets the default (one address is always the default; the first one is). */
	setAsDefault?: boolean;
}
