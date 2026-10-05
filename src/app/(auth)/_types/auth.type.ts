/** Mirrors the backend OTP auth contract (kiva-openapi.yml · Auth). */

export interface SendOtpResponse {
	/** Normalized number for «ارسال شده به …». */
	phone: string;
	codeLength: number;
	expiresInSeconds: number;
	/** Countdown of the circular resend timer. */
	resendAvailableInSeconds: number;
}

export interface VerifyOtpPayload {
	phone: string;
	code: string;
	/** Merges the guest cart into the user's cart. */
	guestCartToken?: string | null;
}
