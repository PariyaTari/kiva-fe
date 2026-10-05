/** Mirrors the backend address / geo contract (kiva-openapi.yml · Addresses). */

export interface City {
	id: number;
	name: string;
	provinceId?: number;
}

export interface Province {
	id: number;
	name: string;
	cities?: City[];
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
	/** «استان، شهر، آدرس». */
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
	setAsDefault?: boolean;
}
