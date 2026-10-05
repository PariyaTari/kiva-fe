"use client";

import { useEffect } from "react";
import SiteShell from "@/app/_components/site/shell/shell";
import Button from "@/app/_components/ui/button/button";
import { IconAlertTriangle, IconHome, IconRefresh } from "@/app/_components/icon/icons";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
	useEffect(() => {
		// surface the error for debugging; a real setup would report it to a service here
		console.error(error);
	}, [error]);

	return (
		<SiteShell>
			<section className="kiva-step-in mx-auto flex min-h-[78vh] max-w-container flex-col items-center justify-center px-4 pb-10 pt-[calc(var(--site-top)+3rem)] text-center sm:px-6">
				<span className="grid h-20 w-20 place-items-center rounded-3xl bg-danger-50 text-danger-600">
					<IconAlertTriangle width={38} height={38} />
				</span>
				<h1 className="mt-6 text-[clamp(1.5rem,3vw,2rem)] font-bold text-theme-heading">یه مشکلی پیش اومد</h1>
				<p className="mt-3 max-w-md leading-8 text-theme-text-muted">
					این بخش درست بارگذاری نشد. دوباره امتحان کن؛ اگه مشکل ادامه داشت با پشتیبانی کیوا در تماس باش.
				</p>
				{error.digest && (
					<p className="dir-ltr mt-3 rounded-lg bg-surface-muted px-3 py-1.5 text-xs text-theme-text-subtle">
						کد خطا: {error.digest}
					</p>
				)}

				<div className="mt-8 flex flex-wrap justify-center gap-3">
					<Button onClick={reset} size="lg" iconStart={<IconRefresh width={18} height={18} />}>
						تلاش مجدد
					</Button>
					<Button href="/" size="lg" variant="white" iconStart={<IconHome width={18} height={18} />}>
						صفحه اصلی
					</Button>
				</div>
			</section>
		</SiteShell>
	);
}
