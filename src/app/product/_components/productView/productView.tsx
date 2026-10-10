"use client";

import { Fragment, useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { notFound, usePathname } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import ErrorComponent from "@/app/_components/common/errorComponent2/errorComponent2";
import { Icon } from "@/app/_components/icon/icons";
import { CartEndpoints } from "@/app/cart/_api/cartEndpoints";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "@/store/notification.store";
import { useUiStore } from "@/store/ui.store";
import { ColorKey } from "@/types/catalog.type";
import { ResultError } from "@/types/result";
import { toErrorView } from "@/utils/apiError";
import { toPersianDigits } from "@/utils/digits";
import { flyToCart } from "@/utils/flyToCart";
import { withMappedError } from "@/utils/withMappedError";
import { ProductEndpoints } from "../../_api/productEndpoints";
import { ProductVariant } from "../../_types/product.type";
import { ERROR_BEHAVIOUR, STOCK_ALERT_ANSWERS } from "../../_utils/apiError";
import AskModal from "../askModal/askModal";
import Gallery from "../gallery/gallery";
import MobileBuyBar from "../mobileBuyBar/mobileBuyBar";
import ProductInfo from "../productInfo/productInfo";
import ProductSkeleton from "../productSkeleton/productSkeleton";
import ProductTabs, { ProductTab } from "../productTabs/productTabs";
import RelatedProducts from "../relatedProducts/relatedProducts";
import VideoModal from "../videoModal/videoModal";

/** How long «به سبد اضافه شد» stays on the add button (design). */
const ADDED_FLASH_MS = 1600;

const subscribeHash = (onChange: () => void) => {
	window.addEventListener("hashchange", onChange);
	return () => window.removeEventListener("hashchange", onChange);
};
const isReviewsHash = () => window.location.hash === "#reviews";

type ProductViewProps = {
	slug: string;
	/** `?color=` of the link (product cards, search) — the colour the page opens with. */
	initialColor?: string;
};

type AddVariables = { variantId: number; quantity: number; colorName: string };

/** Product page — design `product.html`. */
export default function ProductView({ slug, initialColor }: ProductViewProps) {
	const queryClient = useQueryClient();
	const pathname = usePathname();
	const hydrated = useAuthStore((s) => s.hydrated);
	const signedIn = useAuthStore((s) => !!s.accessToken);
	const promptLogin = useUiStore((s) => s.promptLogin);

	const [picked, setPicked] = useState<ColorKey | null>(null);
	const [view, setView] = useState(0);
	const [swapKey, setSwapKey] = useState(0);
	const [qty, setQty] = useState(1);
	// `#reviews` links (account → «نظر بده») open on the reviews tab; the hash is read after hydration (the server never sees it)
	const linkedToReviews = useSyncExternalStore(subscribeHash, isReviewsHash, () => false);
	const [pickedTab, setTab] = useState<ProductTab | null>(null);
	const tab = pickedTab ?? (linkedToReviews ? "rev" : "desc");
	const [modal, setModal] = useState<"ask" | "video" | null>(null);
	const [added, setAdded] = useState(false);
	const buyRef = useRef<HTMLDivElement>(null);

	// wishlist / stock-alert state comes with the token → wait for the session before asking. The server prefetch
	// (`product/[slug]/page.tsx`, same key) fills it as a guest for the HTML; once the session is read it is asked again.
	const product = useQuery({
		queryKey: ["product", "detail", slug],
		queryFn: () => withMappedError(() => ProductEndpoints.getProduct(slug)),
		enabled: hydrated,
	});

	const data = product.data;

	useEffect(() => {
		if (data) document.title = data.seo?.title ?? `${data.name} | کیوا`;
	}, [data]);

	const hasData = !!data;
	useEffect(() => {
		if (!hasData || !linkedToReviews) return;
		const timer = setTimeout(() => document.getElementById("tabsWrap")?.scrollIntoView(), 100);
		return () => clearTimeout(timer);
	}, [hasData, linkedToReviews]);

	useEffect(() => {
		if (!added) return;
		const timer = setTimeout(() => setAdded(false), ADDED_FLASH_MS);
		return () => clearTimeout(timer);
	}, [added]);

	const add = useMutation({
		mutationFn: ({ variantId, quantity }: AddVariables) => withMappedError(() => CartEndpoints.addItem({ variantId, quantity })),
		meta: { showNotification: true },
		onSuccess: (_data, { quantity, colorName }) => {
			flyToCart(document.getElementById("im"));
			queryClient.invalidateQueries({ queryKey: ["cart"] });
			toast(`${data?.name} — ${colorName} (${toPersianDigits(quantity)} عدد) به سبد اضافه شد`, {
				icon: "bag",
				action: { label: "تسویه حساب", href: "/cart" },
			});
		},
	});

	const stockAlert = useMutation({
		mutationFn: ({ productId, variantId }: { productId: number; variantId: number }) =>
			withMappedError(() => ProductEndpoints.createStockAlert(productId, { variantId })),
		onSuccess: (alert) => {
			queryClient.invalidateQueries({ queryKey: ["product", "detail", slug] });
			toast(alert.message ?? "هر وقت موجود شد، بهت پیامک می‌دیم", { icon: "bell", action: { label: "همه‌ی اطلاع‌رسانی‌ها", href: "/account/stock-alerts" } });
		},
		// «already subscribed» / «it's in stock» are answers, not failures
		onError: (error: ResultError) =>
			STOCK_ALERT_ANSWERS.includes(error.code) ? toast(error.description, { icon: "bell" }) : toast(error.description, { type: "error" }),
	});

	if (product.error?.statusCode === 404) notFound();

	// no data yet: still reading the session, or the first request is out (server-prefetched data renders right away)
	if (!data && (!hydrated || product.isLoading)) return <ProductSkeleton />;

	const productError = toErrorView(ERROR_BEHAVIOUR, product.error, "دریافت اطلاعات محصول با خطا مواجه شد.");
	if (productError)
		return (
			<main className="pd-top">
				<div className="container" style={{ paddingBlock: 40 }}>
					<ErrorComponent
						retryable={productError.retryable}
						ticketAble={productError.ticketAble}
						errorText={productError.errorText}
						executeFunction={() => product.refetch()}
						loading={product.isFetching}
					/>
				</div>
			</main>
		);

	if (!data || !data.variants.length) return null;

	const linkColor = data.variants.some((v) => v.color.key === initialColor) ? initialColor : null;
	const colorKey = picked ?? linkColor ?? data.selectedColorKey ?? data.defaultColorKey;
	const variant = data.variants.find((v) => v.color.key === colorKey) ?? data.variants[0];
	const images = variant.media.filter((m) => m.type === "IMAGE").sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
	const video = variant.media.find((m) => m.type === "VIDEO") ?? null;
	const shownView = Math.min(view, Math.max(0, images.length - 1));
	const soldOut = variant.stock.status === "OUT_OF_STOCK";
	const maxQty = Math.max(1, variant.stock.maxOrderQuantity ?? data.policies?.maxPerOrder ?? 1);
	const quantity = Math.min(qty, maxQty);

	const pickColor = (v: ProductVariant) => {
		if (v.id === variant.id) return;
		setPicked(v.color.key);
		setSwapKey((k) => k + 1);
		// shareable link of the colour, without a navigation
		window.history.replaceState(null, "", `${pathname}?color=${v.color.key}`);
	};

	const pickView = (index: number) => {
		setView(index);
		setSwapKey((k) => k + 1);
	};

	const changeQty = (delta: 1 | -1) => {
		const next = Math.min(maxQty, Math.max(1, quantity + delta));
		setQty(next);
		if (delta > 0 && next === maxQty) {
			const left = variant.stock.availableQuantity;
			toast(left != null && left <= maxQty ? `حداکثر موجودی: ${toPersianDigits(left)} عدد` : `حداکثر ${toPersianDigits(maxQty)} عدد در هر سفارش`, {
				icon: "info",
			});
		}
	};

	const addToCart = (flash: boolean) =>
		add.mutate({ variantId: variant.id, quantity, colorName: variant.color.name }, { onSuccess: () => flash && setAdded(true) });

	const notify = () => {
		if (!signedIn) {
			promptLogin("برای اینکه موجود شدنش رو بهت خبر بدیم، اول وارد حساب کاربریت شو.");
			return;
		}
		if (variant.stockAlertSubscribed || data.stockAlert?.subscribed) {
			toast("قبلاً ثبت کردی؛ هر وقت موجود شد بهت پیامک می‌دیم.", { icon: "bell" });
			return;
		}
		stockAlert.mutate({ productId: data.id, variantId: variant.id });
	};

	const openReviews = () => {
		setTab("rev");
		document.getElementById("tabsWrap")?.scrollIntoView({ behavior: "smooth" });
	};

	return (
		<>
			<main className="pd-top">
				<div className="container">
					<nav className="crumbs" aria-label="مسیر" id="crumbs">
						{data.breadcrumbs.map((b, i) => (
							<Fragment key={`${b.label}-${i}`}>
								{i > 0 && <Icon name="left" />}
								{b.url ? <Link href={b.url}>{b.label}</Link> : <span>{b.label}</span>}
							</Fragment>
						))}
					</nav>
					<div className="pd">
						<Gallery
							images={images}
							video={video}
							badges={data.badges}
							art={{ type: data.bagType, color: variant.color.hex }}
							view={shownView}
							swapKey={swapKey}
							onView={pickView}
							onVideo={() => setModal("video")}
						/>
						<ProductInfo
							product={data}
							variant={variant}
							qty={quantity}
							buyRef={buyRef}
							adding={add.isPending}
							added={added}
							notifying={stockAlert.isPending}
							onColor={pickColor}
							onQty={changeQty}
							onAdd={() => addToCart(true)}
							onNotify={notify}
							onAsk={() => setModal("ask")}
							onReviews={openReviews}
						/>
					</div>
					<ProductTabs product={data} tab={tab} onTab={setTab} />
				</div>
				<RelatedProducts productId={data.id} />
			</main>

			<MobileBuyBar
				buyRef={buyRef}
				price={variant.price.price}
				soldOut={soldOut}
				busy={add.isPending || stockAlert.isPending}
				onAdd={() => addToCart(false)}
				onNotify={notify}
			/>

			<AskModal open={modal === "ask"} onClose={() => setModal(null)} productId={data.id} color={variant.color.key} />
			{video && (
				<VideoModal
					key={video.url}
					open={modal === "video"}
					onClose={() => setModal(null)}
					productName={data.name}
					colorName={variant.color.name}
					video={video}
					poster={images[0]?.url}
				/>
			)}
		</>
	);
}
