import "./globals.css";
import type { Metadata, Viewport } from "next";
import { QueryProvider } from "./queryProvider";
import { SessionProvider } from "./sessionProvider";
import Notifications from "@/app/_components/common/notification/notifications";
import SiteShell from "@/app/_components/site/shell/shell";

export const metadata: Metadata = {
	title: {
		default: "کیوا | هرچی ببینی، همون می‌رسه",
		template: "%s | کیوا",
	},
	description: "کیوا، فروشگاه آنلاین کیف‌های مینیمال. قبل از ارسال، عکس کیف خودت رو برات می‌فرستیم.",
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
