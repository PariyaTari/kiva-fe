import { httpClient } from "@/httpClient/HttpClient";
import { BlogCategory, BlogPostDetail, BlogPostListResponse, BlogPostSummary } from "../_types/blog.type";

export type BlogListParams = { category?: string; q?: string; page: number; size: number };

/** Pure request functions — no React Query concepts live here (see data-fetching standard). */
export const BlogEndpoints = {
	getCategories: async () => {
		const res = await httpClient.call<BlogCategory[]>({ method: "GET", url: "blog/categories" });
		return res.data;
	},

	/** Re-requested while the search box is typed into — takes the query's `signal`. */
	getPosts: async (params: BlogListParams, signal?: AbortSignal) => {
		const res = await httpClient.call<BlogPostListResponse>({ method: "GET", url: "blog/posts", params, signal });
		return res.data;
	},

	getPost: async (idOrSlug: string) => {
		const res = await httpClient.call<BlogPostDetail>({ method: "GET", url: `blog/posts/${encodeURIComponent(idOrSlug)}` });
		return res.data;
	},

	getRelated: async (postId: number, limit = 3) => {
		const res = await httpClient.call<BlogPostSummary[]>({ method: "GET", url: `blog/posts/${postId}/related`, params: { limit } });
		return res.data;
	},

	/** «این مطلب مفید بود؟» */
	sendFeedback: async (postId: number, helpful: boolean) => {
		await httpClient.call<void>({ method: "POST", url: `blog/posts/${postId}/feedback`, data: { helpful } });
	},
};
