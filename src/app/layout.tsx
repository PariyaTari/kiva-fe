import "./globals.css";
import type { Metadata } from "next";
import { QueryProvider } from "./queryProvider";
import Notifications from "@/app/_components/common/notification/notifications";

export const metadata: Metadata = {
	title: {
		default: "کیوا | هرچی ببینی، همون می‌رسه",
		template: "%s | کیوا",
	},
	description: "کیوا، فروشگاه آنلاین کیف‌های مینیمال. قبل از ارسال، عکس کیف خودت رو برات می‌فرستیم.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="fa" dir="rtl" suppressHydrationWarning>
			<head>
				<script
					dangerouslySetInnerHTML={{
						__html: `(function(){var t=localStorage.getItem('kiva-theme')||'light';document.documentElement.setAttribute('data-theme',t);})();`,
					}}
				/>
			</head>
			<body>
				<QueryProvider>
					{children}
					<Notifications />
				</QueryProvider>
			</body>
		</html>
	);
}
