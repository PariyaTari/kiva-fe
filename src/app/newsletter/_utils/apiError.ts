import { ResultError } from "@/types/result";

/** Unsubscribe link: the token isn't `nl_` + 32 letters and digits — the page says the link is broken (not a failure toast). */
export const isUnsubscribeTokenError = (e: ResultError | null | undefined) =>
	e?.code === "UNSUBSCRIBE_TOKEN_INVALID" || !!e?.errorDetails?.some((d) => d.field === "token");
