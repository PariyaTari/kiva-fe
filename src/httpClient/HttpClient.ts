import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { API_URL } from "@/config/global";
import { useAuthStore } from "@/store/auth.store";
import { useCartStore } from "@/store/cart.store";
import { AuthTokens } from "@/types/user.type";
import { Response } from "./utils/Response";

const axiosClient = axios.create({
	baseURL: API_URL,
	timeout: 5000000,
});

const REFRESH_URL = "auth/refresh";

// ── request: Bearer for signed-in users, the guest cart token otherwise ──
axiosClient.interceptors.request.use((config) => {
	const { accessToken } = useAuthStore.getState();
	const { guestToken } = useCartStore.getState();
	if (accessToken) config.headers.set("Authorization", `Bearer ${accessToken}`);
	else if (guestToken) config.headers.set("X-Cart-Token", guestToken);
	return config;
});

// One refresh in flight at a time — parallel 401s wait for the same rotation.
let refreshing: Promise<string> | null = null;

function refreshAccessToken(): Promise<string> {
	refreshing ??= (async () => {
		const { refreshToken } = useAuthStore.getState();
		if (!refreshToken) throw new Error("no refresh token");
		const res = await axios.post<AuthTokens>(REFRESH_URL, { refreshToken }, { baseURL: API_URL });
		useAuthStore.getState().setTokens(res.data);
		return res.data.accessToken;
	})().finally(() => {
		refreshing = null;
	});
	return refreshing;
}

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

// ── response: keep the guest cart token the server hands out; rotate expired access tokens once ──
axiosClient.interceptors.response.use(
	(response) => {
		const cartToken = response.headers["x-cart-token"];
		if (cartToken && !useAuthStore.getState().accessToken) useCartStore.getState().setGuestToken(cartToken);
		return response;
	},
	async (error: AxiosError<{ code?: string }>) => {
		const original = error.config as RetriableConfig | undefined;
		const status = error.response?.status;
		const { accessToken } = useAuthStore.getState();

		if (status === 401 && original && accessToken && !original._retried && !String(original.url).includes(REFRESH_URL)) {
			original._retried = true;
			try {
				const token = await refreshAccessToken();
				original.headers.set("Authorization", `Bearer ${token}`);
				return axiosClient.request(original);
			} catch {
				// refresh token is gone/expired → the session is over; continue as a guest
				useAuthStore.getState().clear();
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
