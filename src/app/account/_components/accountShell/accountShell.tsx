"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AuthEndpoints } from "@/app/(auth)/_api/authEndpoints";
import ErrorComponent from "@/app/_components/common/errorComponent2/errorComponent2";
import Loading from "@/app/_components/common/loading/loading";
import { Icon } from "@/app/_components/icon/icons";
import { useRequireLogin } from "@/hooks/useRequireLogin";
import { displayNameOf, useAuthStore } from "@/store/auth.store";
import { useCartStore } from "@/store/cart.store";
import { toErrorView } from "@/utils/apiError";
import { toPersianDigits } from "@/utils/digits";
import { withMappedError } from "@/utils/withMappedError";
import { AccountEndpoints } from "../../_api/accountEndpoints";
import { ERROR_BEHAVIOUR } from "../../_utils/apiError";
import AccountNav from "../accountNav/accountNav";
import AccountStats from "../accountStats/accountStats";

/**
 * Frame of every account panel (design `account.html`): greeting, stat cards, the side card with the menu,
 * and the panel itself. Guests are sent to login and come back to the same panel.
 */
export default function AccountShell({ children }: { children: ReactNode }) {
	const router = useRouter();
	const queryClient = useQueryClient();
	const hydrated = useAuthStore((s) => s.hydrated);
	const signedIn = useAuthStore((s) => !!s.accessToken);
	const storedUser = useAuthStore((s) => s.user);
	const [leaving, setLeaving] = useState(false);

	useRequireLogin(!leaving);

	// the counters live here; panels invalidate ["me", "dashboard"] after changes that move them
	const dashboard = useQuery({
		queryKey: ["me", "dashboard"],
		queryFn: () => withMappedError(() => AccountEndpoints.getDashboard()),
		enabled: hydrated && signedIn,
		meta: { showNotificationOnRefetch: true },
	});

	const logout = useMutation({
		mutationFn: () => withMappedError(() => AuthEndpoints.logout(useAuthStore.getState().refreshToken)),
		// the session ends on this device whatever the server answered (design `K.logout`)
		onSettled: () => {
			useAuthStore.getState().clear();
			useCartStore.getState().setGuestToken(null);
			queryClient.removeQueries({ queryKey: ["me"] });
			queryClient.invalidateQueries();
			router.push("/");
		},
	});

	const user = dashboard.data?.user ?? storedUser;
	const name = user?.fullName || [user?.firstName, user?.lastName].filter(Boolean).join(" ");
	const dashboardError = toErrorView(ERROR_BEHAVIOUR, dashboard.error, "دریافت اطلاعات حساب با خطا مواجه شد.");

	return (
		<main>
			<section className="acc-top">
				<div className="container hello">
					<div>
						<h1 id="hi">{dashboard.data?.greeting ?? `سلام ${displayNameOf(user)}`}</h1>
						<p>سفارش‌ها، عکس‌های کیفت و اطلاعاتت همه این‌جاست.</p>
					</div>
					<Link className="btn btn-white" href="/products">
						<Icon name="bag" /> ادامه خرید
					</Link>
				</div>
			</section>
			<div className="container">
				<AccountStats stats={dashboard.data?.stats} />
				{!!dashboardError && (
					<div style={{ marginTop: 14 }}>
						<ErrorComponent
							retryable={dashboardError.retryable}
							ticketAble={dashboardError.ticketAble}
							errorText={dashboardError.errorText}
							executeFunction={() => dashboard.refetch()}
							height={56}
							loading={dashboard.isFetching}
						/>
					</div>
				)}
				<div className="acc">
					<aside className="side">
						<div className="ucard" id="ucard">
							<span className="av">{user?.avatarInitial || (name || "ک")[0]}</span>
							<span>
								<b>{name || "کاربر کیوا"}</b>
								<small>{user ? toPersianDigits(user.phone) : ""}</small>
							</span>
						</div>
						<AccountNav
							counts={dashboard.data?.navCounts}
							loggingOut={logout.isPending}
							onLogout={() => {
								setLeaving(true);
								logout.mutate();
							}}
						/>
					</aside>
					<section>{hydrated && signedIn ? children : <Loading />}</section>
				</div>
			</div>
		</main>
	);
}
