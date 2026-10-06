"use client";

import { useQuery } from "@tanstack/react-query";
import { formatPrice } from "@/utils/format";
import { withMappedError } from "@/utils/withMappedError";
import { AboutEndpoints } from "../../_api/aboutEndpoints";

/** `.mosaic .m3` «۴۸٬۰۰۰+ عکس قبل از ارسال» — the same stats request as the counters (its error block lives there). */
export default function PhotosTile() {
	const stats = useQuery({
		queryKey: ["site", "stats"],
		queryFn: () => withMappedError(() => AboutEndpoints.getStats()),
	});

	return (
		<div className="m3">
			<b>{stats.data ? `${formatPrice(stats.data.preShipmentPhotos)}+` : "—"}</b>
			<span>عکس قبل از ارسال</span>
		</div>
	);
}
