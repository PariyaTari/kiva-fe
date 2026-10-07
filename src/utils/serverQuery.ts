import { cache } from "react";
import { QueryClient } from "@tanstack/react-query";

/**
 * Server-side prefetch for public pages (SEO): the page fills this client, `PrefetchBoundary` hands the
 * results to the browser's cache, and the client component's own `useQuery` (same key) renders them on the
 * first pass — the HTML carries the content instead of a skeleton.
 *
 * One client per request (`cache`), shared by `generateMetadata` and the page so the API is asked once.
 * `staleTime` only spans that request; it never reaches the browser, whose config stays `staleTime: 0`
 * (the browser re-reads the data right after hydration). A failed prefetch is not dehydrated — the browser
 * fetches and shows its usual error block.
 */
export const getServerQueryClient = cache(
	() =>
		new QueryClient({
			defaultOptions: {
				queries: { retry: false, staleTime: 60_000 },
			},
		}),
);
