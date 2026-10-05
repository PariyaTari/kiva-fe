import axios from "axios";
import { API_URL } from "@/config/global";
import { Response } from "./utils/Response";

const axiosClient = axios.create({
	baseURL: API_URL,
	timeout: 5000000,
});

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
				})
				.then((value) => resolve(new Response<T>(value.data, value.status)))
				.catch((reason) => reject(reason));
		}),
};
