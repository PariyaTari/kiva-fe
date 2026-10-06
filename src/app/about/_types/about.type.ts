/** Mirrors `SiteStats` (`GET /site/stats`) — the «درباره ما» counters. */
export interface SiteStats {
	happyCustomers: number;
	preShipmentPhotos: number;
	photoMatchSatisfactionPercent: number;
	productModels: number;
}
