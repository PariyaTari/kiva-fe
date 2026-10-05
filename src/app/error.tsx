"use client";

import "./_styles/notFound.css";
import { useEffect } from "react";
import BagArt from "@/app/_components/shop/bagArt/bagArt";
import Button from "@/app/_components/ui/button/button";
import { Icon } from "@/app/_components/icon/icons";

/** Render-error fallback — same visual language as the 404 (`.nf`). */
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
	useEffect(() => {
		// surface the error for debugging; a real setup would report it to a service here
		console.error(error);
	}, [error]);

	return (
		<div className="pg-404">
			<main className="nf">
				<div className="container">
					<div style={{ width: 170, margin: "0 auto" }}>
						<BagArt type="cross" color="lilac" variant={2} />
					</div>
					<h1>یه مشکلی پیش اومد</h1>
					<p>
						این بخش درست بارگذاری نشد. دوباره امتحان کن؛ اگه مشکل ادامه داشت با پشتیبانی کیوا در تماس باش.
						{error.digest && (
							<>
								<br />
								<small className="ltr">کد خطا: {error.digest}</small>
							</>
						)}
					</p>
					<div className="acts">
						<Button onClick={reset} size="lg" iconStart={<Icon name="refresh" />}>
							تلاش مجدد
						</Button>
						<Button href="/" variant="white" size="lg" iconStart={<Icon name="home" />}>
							صفحه اصلی
						</Button>
					</div>
				</div>
			</main>
		</div>
	);
}
