import { httpClient } from "@/httpClient/HttpClient";
import { ContactMessagePayload, ContactMessageResponse, ContactTopicOption } from "../_types/contact.type";

/** Pure request functions — no React Query concepts live here (see data-fetching standard). */
export const ContactEndpoints = {
	getTopics: async () => {
		const res = await httpClient.call<ContactTopicOption[]>({ method: "GET", url: "contact/topics" });
		return res.data;
	},

	/** Guests and signed-in shoppers alike — the answer carries a `CT-…` follow-up code. */
	sendMessage: async (payload: ContactMessagePayload) => {
		const res = await httpClient.call<ContactMessageResponse>({ method: "POST", url: "contact/messages", data: payload });
		return res.data;
	},
};
