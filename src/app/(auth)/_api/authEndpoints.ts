import { httpClient } from "@/httpClient/HttpClient";
import { AuthResponse } from "@/types/user.type";
import { SendOtpResponse, VerifyOtpPayload } from "../_types/auth.type";

/**
 * Pure request functions — no React Query concepts live here (see data-fetching standard).
 * The refresh token is the HttpOnly `kiva_rt` cookie: the requests that set or clear it go `withCredentials`,
 * otherwise the browser drops the response's `Set-Cookie` (FRONTEND_AUTH §2). `POST /auth/refresh` is in `httpClient/session`.
 */
export const AuthEndpoints = {
	/** Login and sign-up are the same flow — a 5-digit SMS code. The answer is the same whether the number has an account or not. */
	sendOtp: async (phone: string) => {
		const res = await httpClient.call<SendOtpResponse>({ method: "POST", url: "auth/otp/send", data: { phone, purpose: "LOGIN" } });
		return res.data;
	},

	/** Sets the session cookie; the access token comes in the body. */
	verifyOtp: async (payload: VerifyOtpPayload) => {
		const res = await httpClient.call<AuthResponse>({ method: "POST", url: "auth/otp/verify", data: payload, withCredentials: true });
		return res.data;
	},

	/** Ends this device's session and clears the cookie — always `204`, even when already signed out. */
	logout: async () => {
		await httpClient.call<void>({ method: "POST", url: "auth/logout", withCredentials: true });
	},
};
