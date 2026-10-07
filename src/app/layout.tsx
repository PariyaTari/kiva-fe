import "./globals.css";
import type { Metadata, Viewport } from "next";
import { QueryProvider } from "./queryProvider";
import { SessionProvider } from "./sessionProvider";
import Notifications from "@/app/_components/common/notification/notifications";
import SiteShell from "@/app/_components/site/shell/shell";
import { SITE_URL } from "@/config/global";
import { SITE_LOCALE, SITE_NAME } from "@/utils/seo";

const DEFAULT_TITLE = "کیوا | هرچی ببینی، همون می‌رسه";
const DESCRIPTION = "کیوا، فروشگاه آنلاین کیف‌های مینیمال. قبل از ارسال، عکس کیف خودت رو برات می‌فرستیم.";

export const metadata: Metadata = {
	// relative canonical / Open Graph URLs resolve against the public origin
	metadataBase: new URL(SITE_URL),
	title: {
		default: DEFAULT_TITLE,
		template: "%s | کیوا",
	},
	description: DESCRIPTION,
	applicationName: SITE_NAME,
	// no title here: a page without its own `openGraph` would share the home page's (public pages set theirs via `pageMetadata`)
	openGraph: { type: "website", siteName: SITE_NAME, locale: SITE_LOCALE },
	twitter: { card: "summary" },
};

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="fa" dir="rtl">
			<body>
				<QueryProvider>
					<SessionProvider />
					<SiteShell>{children}</SiteShell>
					<Notifications />
				</QueryProvider>
			</body>
		</html>
	);
}
