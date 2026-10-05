"use client";

import { useState } from "react";
import classNames from "classnames";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Icon } from "@/app/_components/icon/icons";
import { WishlistEndpoints } from "@/app/wishlist/_api/wishlistEndpoints";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "@/store/notification.store";
import { useUiStore } from "@/store/ui.store";
import { ColorKey } from "@/types/catalog.type";
import { withMappedError } from "@/utils/withMappedError";

type WishlistToggleProps = {
	productId: number;
	colorKey?: ColorKey | null;
	/** `pcard-wish` (card heart) or `wish-big` (product page). */
	className: string;
	ariaLabel?: string;
	/** Called after a successful toggle (e.g. a page that lists wishlist items re-renders). */
	onToggled?: (wishlisted: boolean) => void;
};

/** Heart button — guests get the «اول وارد شو» prompt (design `K.wish.toggle`). */
export default function WishlistToggle({ productId, colorKey, className, ariaLabel = "افزودن به علاقه‌مندی‌ها", onToggled }: WishlistToggleProps) {
	const queryClient = useQueryClient();
	const hydrated = useAuthStore((s) => s.hydrated);
	const signedIn = useAuthStore((s) => !!s.accessToken);
	const promptLogin = useUiStore((s) => s.promptLogin);
	// bump to replay the `.pop` animation on every click
	const [popKey, setPopKey] = useState(0);

	const wishlistIds = useQuery({
		queryKey: ["wishlist", "ids"],
		queryFn: () => withMappedError(() => WishlistEndpoints.getIds()),
		enabled: hydrated && signedIn,
	});

	const toggle = useMutation({
		mutationFn: (add: boolean) => withMappedError(() => (add ? WishlistEndpoints.add(productId, colorKey) : WishlistEndpoints.remove(productId))),
		meta: { showNotification: true },
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ["wishlist"] });
			toast(data.wishlisted ? "به علاقه‌مندی‌ها اضافه شد" : "از علاقه‌مندی‌ها حذف شد", {
				icon: "heart",
				action: data.wishlisted ? { label: "مشاهده", href: "/wishlist" } : undefined,
			});
			onToggled?.(data.wishlisted);
		},
	});

	const saved = !!wishlistIds.data?.productIds.includes(productId);
	// optimistic while the request runs
	const on = signedIn && (toggle.isPending ? !!toggle.variables : saved);

	const handleClick = () => {
		if (!signedIn) {
			promptLogin("برای ذخیره در علاقه‌مندی‌ها اول وارد حساب کاربریت شو.");
			return;
		}
		setPopKey((k) => k + 1);
		toggle.mutate(!saved);
	};

	return (
		<button
			key={popKey}
			type="button"
			className={classNames(className, { on, pop: popKey > 0 })}
			onClick={handleClick}
			disabled={toggle.isPending}
			aria-label={ariaLabel}
			aria-pressed={on}
		>
			<Icon name="heart" />
		</button>
	);
}
