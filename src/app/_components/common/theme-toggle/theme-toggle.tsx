"use client";

import { useSyncExternalStore } from "react";
import { IconMoon, IconSun } from "@/app/_components/icon/icons";

type Theme = "light" | "dark";

/** Keep in sync with the no-flash script in `src/app/layout.tsx`. */
const THEME_STORAGE_KEY = "kiva-theme";

// The no-flash script sets `data-theme` on <html> before hydration, so the DOM attribute is the
// source of truth; the server has no theme (null), which keeps the icon out of the SSR markup.
function subscribe(onChange: () => void) {
	const observer = new MutationObserver(onChange);
	observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
	return () => observer.disconnect();
}

const getSnapshot = (): Theme => (document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light");

const getServerSnapshot = (): Theme | null => null;

export function ThemeToggle({ className = "" }: { className?: string }) {
	const theme = useSyncExternalStore<Theme | null>(subscribe, getSnapshot, getServerSnapshot);

	function toggle() {
		const next: Theme = theme === "dark" ? "light" : "dark";
		document.documentElement.setAttribute("data-theme", next);
		localStorage.setItem(THEME_STORAGE_KEY, next);
	}

	const isDark = theme === "dark";

	return (
		<button
			onClick={toggle}
			aria-label={isDark ? "روشن کردن تم لایت" : "روشن کردن تم دارک"}
			title={isDark ? "تم لایت" : "تم دارک"}
			className={`relative grid h-[42px] w-[42px] shrink-0 place-items-center rounded-full text-theme-text transition-colors hover:bg-surface-raised ${className}`}
		>
			{theme && (
				<span className="relative block h-[22px] w-[22px]">
					<IconSun
						width={22}
						height={22}
						className={`absolute inset-0 transition-all duration-300 ${
							isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
						}`}
					/>
					<IconMoon
						width={22}
						height={22}
						className={`absolute inset-0 transition-all duration-300 ${
							isDark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
						}`}
					/>
				</span>
			)}
		</button>
	);
}
