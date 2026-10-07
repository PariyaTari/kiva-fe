import { loadHomePage } from "@/app/(home)/_utils/loadHomePage";

// fresh on every call: prices, stock and the campaign's `serverTime` (the countdown) come from the backend
export const dynamic = "force-dynamic";

/** `GET /kiva-configs/home` — the home page: this project's copy + the live catalog parts, instead of the backend's `GET /home`. */
export async function GET() {
	return Response.json(await loadHomePage());
}
