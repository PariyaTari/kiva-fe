import { httpClient } from "@/httpClient/HttpClient";
import { AuthResponse } from "@/types/user.type";
import { SendOtpResponse, VerifyOtpPayload } from "../_types/auth.type";

/** Pure request functions — no React Query concepts live here (see data-fetching standard). */
export const AuthEndpoints = {
	/** Login and sign-up are the same flow — a 5-digit SMS code. */
	sendOtp: async (phone: string) => {
		const res = await httpClient.call<SendOtpResponse>({ method: "POST", url: "auth/otp/send", data: { phone, purpose: "LOGIN" } });
		return res.data;
	},

	verifyOtp: async (payload: VerifyOtpPayload) => {
		const res = await httpClient.call<AuthResponse>({ method: "POST", url: "auth/otp/verify", data: payload });
		return res.data;
	},

	logout: async (refreshToken: string | null) => {
		await httpClient.call<void>({ method: "POST", url: "auth/logout", data: { refreshToken } });
	},
};
