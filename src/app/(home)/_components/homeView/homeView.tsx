"use client";

import { useQuery } from "@tanstack/react-query";
import ErrorComponent from "@/app/_components/common/errorComponent2/errorComponent2";
import Loading from "@/app/_components/common/loading/loading";
import { toErrorView } from "@/utils/apiError";
import { withMappedError } from "@/utils/withMappedError";
import { HomeEndpoints } from "../../_api/homeEndpoints";
import { ERROR_BEHAVIOUR } from "../../_utils/apiError";
import CategoryGrid from "../categoryGrid/categoryGrid";
import FeatureStrip from "../featureStrip/featureStrip";
import HeroSection from "../heroSection/heroSection";
import HowItWorks from "../howItWorks/howItWorks";
import NewArrivals from "../newArrivals/newArrivals";
import PromoBanners from "../promoBanners/promoBanners";
import SaleSection from "../saleSection/saleSection";
import TestimonialsSection from "../testimonialsSection/testimonialsSection";

/** Home page body — one aggregate request (this app's `/kiva-configs/home`) feeds every section; an empty catalog part is left out. */
export default function HomeView() {
	// same key as the server prefetch in `(home)/page.tsx`
	const home = useQuery({
		queryKey: ["home", "page"],
		queryFn: () => withMappedError(() => HomeEndpoints.getHome()),
		meta: { showNotificationOnRefetch: true },
	});

	const homeError = toErrorView(ERROR_BEHAVIOUR, home.error, "دریافت اطلاعات صفحه اصلی با خطا مواجه شد.");

	if (home.isLoading || homeError || !home.data) {
		// keep the lilac hero frame while loading / on error so the page doesn't jump
		return (
			<section className="hero" aria-label="بنر">
				<div className="container hero-in" style={{ gridTemplateColumns: "1fr" }}>
					{home.isLoading ? (
						<Loading />
					) : homeError ? (
						<ErrorComponent
							retryable={homeError.retryable}
							ticketAble={homeError.ticketAble}
							errorText={homeError.errorText}
							executeFunction={() => home.refetch()}
							loading={home.isFetching}
						/>
					) : null}
				</div>
			</section>
		);
	}

	const data = home.data;

	return (
		<>
			<HeroSection hero={data.hero} />
			<FeatureStrip features={data.features} />
			{data.categories.length > 0 && <CategoryGrid categories={data.categories} />}
			{data.newArrivals.length > 0 && <NewArrivals products={data.newArrivals} />}
			<PromoBanners promos={data.promos} />
			{data.sale && <SaleSection sale={data.sale} receivedAt={home.dataUpdatedAt} />}
			{!!data.testimonials?.items.length && <TestimonialsSection testimonials={data.testimonials} />}
			<HowItWorks steps={data.howItWorks} />
		</>
	);
}
