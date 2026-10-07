import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { API_URL } from "@/config/global";
import { readPersistedTokens, useAuthStore } from "@/store/auth.store";
import { useCartStore } from "@/store/cart.store";
import { AuthTokens } from "@/types/user.type";
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

const REFRESH_URL = "auth/refresh";
/** Web Locks name — one tab at a time spends the (single-use, rotating) refresh token. */
const REFRESH_LOCK = "kiva-auth-refresh";

// ── request: Bearer for signed-in users, the guest cart token otherwise ──
// The session lives in this browser's storage; on the server (page prefetch) every request is an anonymous one,
// and the stores there are module singletons shared by all visitors — never read or write them.
axiosClient.interceptors.request.use((config) => {
	if (IS_SERVER) return config;
	const { accessToken } = useAuthStore.getState();
	const { guestToken } = useCartStore.getState();
	if (accessToken) config.headers.set("Authorization", `Bearer ${accessToken}`);
	else if (guestToken) config.headers.set("X-Cart-Token", guestToken);
	return config;
});

// One refresh in flight per tab — parallel 401s wait for the same rotation.
let refreshing: Promise<string> | null = null;

/** The refresh token was refused (expired, revoked or already rotated) — unlike a network failure, the session is over. */
class SessionEndedError extends Error {}

/** Runs `task` while holding the cross-tab lock; without Web Locks (old browsers) it simply runs. */
async function withRefreshLock<T>(task: () => Promise<T>): Promise<T> {
	return typeof navigator !== "undefined" && navigator.locks ? await navigator.locks.request(REFRESH_LOCK, task) : task();
}

/**
 * A fresh access token for a request that got 401 with `staleToken`. Rotation is single-use, so tabs take turns:
 * whoever holds the lock first rotates and saves; the others then find the new pair in storage and adopt it
 * instead of spending the revoked refresh token (which would end the session in every tab).
 */
function refreshAccessToken(staleToken: string): Promise<string> {
	refreshing ??= withRefreshLock(async () => {
		const saved = readPersistedTokens();
		// signed out (here or in another tab) meanwhile
		if (!saved) throw new SessionEndedError();
		// another tab — or an earlier refresh in this one — already rotated
		if (saved.accessToken !== staleToken) {
			useAuthStore.getState().setTokens(saved);
			return saved.accessToken;
		}
		try {
			const res = await axios.post<AuthTokens>(REFRESH_URL, { refreshToken: saved.refreshToken }, { baseURL: API_URL, timeout: DEFAULT_TIMEOUT_MS });
			useAuthStore.getState().setTokens(res.data);
			return res.data.accessToken;
		} catch (err) {
			const status = (err as AxiosError).response?.status;
			if (status === 400 || status === 401) throw new SessionEndedError();
			throw err;
		}
	}).finally(() => {
		refreshing = null;
	});
	return refreshing;
}

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

// ── response: keep the guest cart token the server hands out; rotate expired access tokens once ──
axiosClient.interceptors.response.use(
	(response) => {
		const cartToken = response.headers["x-cart-token"];
		if (!IS_SERVER && cartToken && !useAuthStore.getState().accessToken) useCartStore.getState().setGuestToken(cartToken);
		return response;
	},
	async (error: AxiosError<{ code?: string }>) => {
		const original = error.config as RetriableConfig | undefined;
		const status = error.response?.status;
		// the token this request was sent with — not the current one, which a parallel refresh may have replaced
		const sentToken = String(original?.headers.get("Authorization") ?? "").replace(/^Bearer /, "");

		if (status === 401 && original && sentToken && !original._retried && !String(original.url).includes(REFRESH_URL)) {
			original._retried = true;
			try {
				const token = await refreshAccessToken(sentToken);
				original.headers.set("Authorization", `Bearer ${token}`);
				return axiosClient.request(original);
			} catch (refreshError) {
				// the refresh token was refused → the session is over; continue as a guest.
				// A network failure keeps the session — the original 401 surfaces and a later request tries again.
				if (refreshError instanceof SessionEndedError) useAuthStore.getState().clear();
			}
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
}

export const httpClient = {
	call: <T>(config: RequestConfig) =>
		new Promise<Response<T>>((resolve, reject) => {
			axiosClient
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
					onUploadProgress: config.onUploadProgress
						? (e) => config.onUploadProgress?.(e.total ? Math.min(100, Math.round((e.loaded / e.total) * 100)) : 0)
						: undefined,
					// arrays go as `category=a,b` — the API's `style: form, explode: false`
					paramsSerializer: { indexes: null, serialize: serializeParams },
				})
				.then((value) => resolve(new Response<T>(value.data, value.status)))
				.catch((reason) => readBlobProblem(reason).then(reject));
		}),
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
