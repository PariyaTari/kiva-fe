import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { API_URL } from "@/config/global";
import { useAuthStore } from "@/store/auth.store";
import { useCartStore } from "@/store/cart.store";
import { refreshSession } from "./session";
import { Response } from "./utils/Response";

const IS_SERVER = typeof window === "undefined";

/**
 * A request that hangs longer than this is reported as `TIMEOUT`. On the server (page prefetch) it is short:
 * a slow API must not hold the page back — the browser fetches the data itself instead.
 * Uploads and downloads pass their own, longer value.
 */
const DEFAULT_TIMEOUT_MS = IS_SERVER ? 8_000 : 20_000;

const axiosClient = axios.create({
	baseURL: API_URL,
	timeout: DEFAULT_TIMEOUT_MS,
});

/**
 * This storefront's own route handlers (`/kiva-configs/config`, `/kiva-configs/home`) — content the project owns instead of the
 * backend. Same origin, so no session or cart headers; browser only (server code calls the loaders directly).
 */
const nextAxios = axios.create({
	baseURL: "/kiva-configs/",
	timeout: DEFAULT_TIMEOUT_MS,
});

// ── request: Bearer for signed-in users, the guest cart token otherwise ──
// The session lives in this tab's memory; on the server (page prefetch) every request is an anonymous one,
// and the stores there are module singletons shared by all visitors — never read or write them.
axiosClient.interceptors.request.use((config) => {
	if (IS_SERVER) return config;
	const { accessToken } = useAuthStore.getState();
	const { guestToken } = useCartStore.getState();
	if (accessToken) config.headers.set("Authorization", `Bearer ${accessToken}`);
	else if (guestToken) config.headers.set("X-Cart-Token", guestToken);
	return config;
});

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

// ── response: keep the guest cart token the server hands out; renew a refused access token once ──
axiosClient.interceptors.response.use(
	(response) => {
		const cartToken = response.headers["x-cart-token"];
		if (!IS_SERVER && cartToken && !useAuthStore.getState().accessToken) useCartStore.getState().setGuestToken(cartToken);
		return response;
	},
	async (error: AxiosError) => {
		const original = error.config as RetriableConfig | undefined;
		// the token this request was sent with — not the current one, which a parallel refresh may have replaced
		const sentToken = String(original?.headers.get("Authorization") ?? "").replace(/^Bearer /, "");

		// TOKEN_EXPIRED is the usual case; UNAUTHORIZED with a token (the server's key changed) is fixed by a refresh too.
		// Without a token a 401 is a plain «sign in first».
		if (error.response?.status === 401 && original && sentToken && !original._retried) {
			original._retried = true;
			const current = useAuthStore.getState().accessToken;
			// signed out meanwhile
			if (!current) throw error;
			let token: string;
			try {
				// a refresh in this tab already replaced the token this request went with
				token = current !== sentToken ? current : await refreshSession();
			} catch {
				// the session ended (`refreshSession` signed this browser out — `SessionProvider` then re-fetches
				// everything as a guest) or the refresh didn't get through: the original 401 surfaces
				throw error;
			}
			original.headers.set("Authorization", `Bearer ${token}`);
			return axiosClient.request(original);
		}
		throw error;
	},
);

export type RequestHeaders = Record<string, string | number | boolean>;

export type Method = "GET" | "DELETE" | "HEAD" | "OPTIONS" | "POST" | "PUT" | "PATCH";

export type ResponseType = "arraybuffer" | "blob" | "document" | "json" | "text" | "stream";

export interface RequestConfig<D = unknown> {
	signal?: AbortSignal;
	url?: string;
	method?: Method;
	baseURL?: string;
	headers?: RequestHeaders;
	params?: unknown;
	data?: D;
	timeout?: number;
	timeoutErrorMessage?: string;
	responseType?: ResponseType;
	/** Upload progress of a multipart body, 0–100. */
	onUploadProgress?: (percent: number) => void;
	/**
	 * Send and accept cookies (`credentials: 'include'`) — only the requests that set or read the `kiva_rt` session
	 * cookie: OTP verify, logout, phone-change verify. Without it the browser drops the response's `Set-Cookie`.
	 */
	withCredentials?: boolean;
}

const request = <T>(client: AxiosInstance, config: RequestConfig) =>
	new Promise<Response<T>>((resolve, reject) => {
		client
			.request({
				signal: config.signal,
				url: config.url,
				method: config.method,
				baseURL: config.baseURL,
				headers: config.headers,
				params: config.params,
				data: config.data,
				timeout: config.timeout,
				timeoutErrorMessage: config.timeoutErrorMessage,
				responseType: config.responseType,
				withCredentials: config.withCredentials,
				onUploadProgress: config.onUploadProgress
					? (e) => config.onUploadProgress?.(e.total ? Math.min(100, Math.round((e.loaded / e.total) * 100)) : 0)
					: undefined,
				// arrays go as `category=a,b` — the API's `style: form, explode: false`
				paramsSerializer: { indexes: null, serialize: serializeParams },
			})
			.then((value) => resolve(new Response<T>(value.data, value.status)))
			.catch((reason) => readBlobProblem(reason).then(reject));
	});

/** The backend API (`NEXT_PUBLIC_API_URL`). */
export const httpClient = {
	call: <T>(config: RequestConfig) => request<T>(axiosClient, config),
};

/** This app's route handlers under `/kiva-configs/` — errors map the same way (`withMappedError`). */
export const nextApiClient = {
	call: <T>(config: RequestConfig) => request<T>(nextAxios, config),
};

/**
 * With `responseType: "blob"` (file downloads) a failure's problem+json body arrives as a Blob too —
 * parse it back so `mapError` sees the usual `{ code, message }`.
 */
async function readBlobProblem(reason: AxiosError) {
	const response = reason?.response;
	const data: unknown = response?.data;
	if (!response || typeof Blob === "undefined" || !(data instanceof Blob) || !/json/.test(data.type)) return reason;
	try {
		response.data = JSON.parse(await data.text());
	} catch {
		// not JSON after all — mapError falls back to the status
	}
	return reason;
}

/** `{ category: ["shoulder","cross"], onSale: true, q: undefined }` → `category=shoulder,cross&onSale=true`. */
function serializeParams(params: Record<string, unknown>): string {
	const search = new URLSearchParams();
	Object.entries(params ?? {}).forEach(([key, value]) => {
		if (value === undefined || value === null || value === "" || (Array.isArray(value) && !value.length)) return;
		search.set(key, Array.isArray(value) ? value.join(",") : String(value));
	});
	return search.toString();
}
