import { ApiFieldError, ApiProblem } from "@/types/apiResponse.type";
import { ErrorDetail, ResultError } from "@/types/result";

export enum InternalErrorCode {
	NETWORK_ERROR = "NETWORK_ERROR",
	TIMEOUT = "TIMEOUT",
	UNKNOWN = "UNKNOWN_ERROR",
	SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",
	NOT_FOUND = "NOT_FOUND",
	APP_ERROR = "APP_ERROR",
}

/** The parts of a thrown axios (or other) failure this mapper reads. */
type RequestFailure = {
	code?: string;
	message?: string;
	response?: {
		status?: number;
		data?: Partial<ApiProblem> | null;
	};
};

/**
 * The Kiva error body is an RFC 7807 problem (`application/problem+json`): a stable machine `code`,
 * a Persian `message` that is safe to show as-is, and `errors[]` for per-field validation failures.
 */
function coerceMessage(message: unknown): string {
	if (typeof message === "string" && message.trim() !== "") return message;
	return "خطای غیرمنتظره‌ای رخ داده است.";
}

function extractDetails(errors: ApiFieldError[] | undefined): ErrorDetail[] | null {
	if (!Array.isArray(errors)) return null;
	const details = errors
		.filter((item): item is ApiFieldError => !!item && typeof item === "object")
		.map((item) => ({ field: item.field ?? null, code: item.code ?? null, message: item.message }));
	return details.length > 0 ? details : null;
}

/** Normalizes any thrown request failure (axios or otherwise) into a `ResultError`. */
export function mapError(error: unknown): ResultError {
	const err = (error ?? {}) as RequestFailure;
	const status: number = err.response?.status ?? 0;
	const data = err.response?.data;

	if (!data?.message && status === 404) {
		return {
			success: false,
			description: "هیچ آدرسی متناسب با درخواست شما یافت نشد",
			code: InternalErrorCode.NOT_FOUND,
			statusCode: status,
			errorDetails: null,
			meta: null,
		};
	}

	if (err.code === "ECONNABORTED" || status === 504) {
		return {
			success: false,
			description: "مدت‌زمان پاسخ‌گویی سرور به پایان رسید. لطفاً مجدداً تلاش کنید.",
			code: InternalErrorCode.TIMEOUT,
			statusCode: status,
			errorDetails: null,
			meta: null,
		};
	}

	if (err.message === "Network Error") {
		return {
			success: false,
			description: "امکان برقراری ارتباط با سرور وجود ندارد. اتصال اینترنت یا وضعیت سرور را بررسی کنید.",
			code: InternalErrorCode.NETWORK_ERROR,
			statusCode: status,
			errorDetails: null,
			meta: null,
		};
	}

	if (status === 502 || status === 503) {
		return {
			success: false,
			description: "سرویس در حال حاضر در دسترس نیست. لطفاً بعداً دوباره تلاش کنید.",
			code: InternalErrorCode.SERVICE_UNAVAILABLE,
			statusCode: status,
			errorDetails: null,
			meta: null,
		};
	}

	if (data?.message) {
		return {
			success: false,
			description: coerceMessage(data.message),
			code: data.code ?? InternalErrorCode.APP_ERROR,
			statusCode: status,
			errorDetails: extractDetails(data.errors),
			meta: data.meta ?? null,
		};
	}

	return {
		success: false,
		description: err.message ?? "خطای غیرمنتظره‌ای رخ داده است. لطفاً بعداً تلاش کنید.",
		code: InternalErrorCode.UNKNOWN,
		statusCode: status,
		errorDetails: null,
		meta: null,
	};
}
