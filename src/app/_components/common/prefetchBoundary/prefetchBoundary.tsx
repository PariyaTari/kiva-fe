import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";

/**
 * How long a hydrated query may sit with no component using it. The project's `gcTime: 0` would schedule
 * its removal right away, and a hydration render that yields before the component subscribes could lose
 * the data (and flash a skeleton). A few seconds covers the hydration pass; the browser re-reads the data anyway.
 */
const HYDRATED_GC_MS = 10_000;

/** Server component — passes what the page prefetched (`getServerQueryClient`) to the browser's query cache. */
export default function PrefetchBoundary({ client, children }: { client: QueryClient; children: React.ReactNode }) {
	return (
		<HydrationBoundary state={dehydrate(client)} options={{ defaultOptions: { queries: { gcTime: HYDRATED_GC_MS } } }}>
			{children}
		</HydrationBoundary>
	);
}
