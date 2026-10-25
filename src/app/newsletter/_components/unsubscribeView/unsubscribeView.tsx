"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Icon } from "@/app/_components/icon/icons";
import BagArt from "@/app/_components/shop/bagArt/bagArt";
import { SiteEndpoints } from "@/app/_components/site/_api/siteEndpoints";
import Button from "@/app/_components/ui/button/button";
import { toast } from "@/store/notification.store";
import { withMappedError } from "@/utils/withMappedError";
import { isUnsubscribeTokenError } from "../../_utils/apiError";

/** `nl_` + 32 Latin letters and digits — anything else is `400 UNSUBSCRIBE_TOKEN_INVALID`. */
const TOKEN = /^nl_[0-9A-Za-z]{32}$/;

/**
 * Leaving the newsletter from the welcome e-mail's link. Not in the design: the 404 page's centred layout. It waits for a
 * click — mail scanners open links on their own, and that mustn't unsubscribe anyone.
 */
export default function UnsubscribeView({ token }: { token: string }) {
	const [state, setState] = useState<"ask" | "done" | "bad">(TOKEN.test(token) ? "ask" : "bad");

	const unsubscribe = useMutation({
		mutationFn: () => withMappedError(() => SiteEndpoints.unsubscribeNewsletter(token)),
		onSuccess: () => setState("done"),
		onError: (e) => (isUnsubscribeTokenError(e) ? setState("bad") : toast(e.description, { type: "error" })),
	});

	return (
		<main className="nf">
			<div className="container">
				<div style={{ width: 150, margin: "0 auto" }}>
					<BagArt type={state === "done" ? "wallet" : "bucket"} color="lilac" variant={2} />
				</div>
				{state === "done" ? (
					<>
						<h1>عضویتت لغو شد</h1>
						<p>دیگه ایمیل خبرنامه‌ی کیوا برات نمی‌آد. هر وقت خواستی، از پایین همه‌ی صفحه‌ها دوباره عضو شو.</p>
						<div className="acts">
							<Button href="/products" size="lg" iconStart={<Icon name="bag" />}>
								رفتن به فروشگاه
							</Button>
						</div>
					</>
				) : state === "bad" ? (
					<>
						<h1>این لینک درست نیست</h1>
						<p>لینک لغو عضویت کامل نیست یا عوض شده. همون لینک ته ایمیل خبرنامه رو دوباره باز کن.</p>
						<div className="acts">
							<Button href="/" size="lg" iconStart={<Icon name="home" />}>
								صفحه اصلی
							</Button>
							<Button href="/contact" size="lg" variant="outline">
								تماس با پشتیبانی
							</Button>
						</div>
					</>
				) : (
					<>
						<h1>لغو عضویت خبرنامه</h1>
						<p>با لغو عضویت، ایمیل کالکشن‌های جدید، تخفیف‌های خصوصی و کدهای هدیه دیگه برات فرستاده نمی‌شه.</p>
						<div className="acts">
							<Button size="lg" variant="dark" isLoading={unsubscribe.isPending} onClick={() => unsubscribe.mutate()}>
								لغو عضویت
							</Button>
							<Button href="/" size="lg" variant="outline">
								منصرف شدم
							</Button>
						</div>
					</>
				)}
			</div>
		</main>
	);
}
