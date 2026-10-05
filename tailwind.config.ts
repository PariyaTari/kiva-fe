import type { Config } from "tailwindcss";

const config: Config = {
    content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
    darkMode: ["selector", '[data-theme="dark"]'],
    theme: {
        extend: {
            colors: {
                // ─── Primary — brand purple (buttons, links, announcement bar, sale tag).
                // The light end of the scale is the lilac family of the design system ──
                primary: {
                    50: "#f3eefa", // lilac-50 — section & product-photo background
                    100: "#e4d9f3", // tag background
                    200: "#d6c8eb",
                    300: "#c8b6e2", // lilac — main brand colour
                    400: "#b9a3db", // tag border
                    500: "#8a6cbf",
                    600: "#5b3e8c", // purple — CTA
                    700: "#4a3173",
                    800: "#3e2a63", // tag text
                    900: "#2a1f3d", // ink — body text, dark buttons, footer
                    950: "#1c142b",
                },
                // ─── Secondary — warm cream/sand accent (logo dot, cream boxes, gold details) ──
                secondary: {
                    50: "#fbf8f4",
                    100: "#f5ede3", // cream
                    200: "#ecdfcd",
                    300: "#d9c4a8", // cream border / logo dot
                    400: "#cdaa6e", // gold
                    500: "#b8925a",
                    600: "#9a7646",
                    700: "#7d5e3a",
                    800: "#6b5333", // cream tag text
                    900: "#4d3c26",
                    950: "#2e2416",
                },
                // ─── Slate — neutral gray tinted with the ink hue (ink-70/50/30 + lines, solidified) ──
                slate: {
                    50: "#f8f7fa",
                    100: "#f1eff4",
                    200: "#eae9ec",
                    300: "#d4d2d8",
                    400: "#bfbcc5",
                    500: "#8c8696",
                    600: "#665e73",
                    700: "#4a4157",
                    800: "#352b47",
                    900: "#2a1f3d",
                    950: "#1a1326",
                },
                success: {
                    50: "#e5f3ec",
                    100: "#b9dccb",
                    500: "#3f9a72",
                    600: "#2f7d5b",
                    700: "#24624a",
                },
                warning: {
                    50: "#fbf1dc",
                    100: "#ecd6a6",
                    500: "#c48a1c",
                    600: "#9a6b12",
                    700: "#7a540e",
                },
                danger: {
                    50: "#fbeaec",
                    100: "#f0c4cb",
                    500: "#c94a5e",
                    600: "#b3364a",
                    700: "#8f2b3b",
                },
                error: {
                    50: "#fbeaec",
                    100: "#f0c4cb",
                    500: "#c94a5e",
                    600: "#b3364a",
                    700: "#8f2b3b",
                },
                // ─── Info — not in the source design; derived from the palette's blue swatch ──
                info: {
                    50: "#ecf1f8",
                    100: "#c9d6ea",
                    500: "#5677ae",
                    600: "#46659a",
                    700: "#37507c",
                },
                // ─── Theme tokens (switch with data-theme) ──────────
                background: "var(--background)",
                surface: "var(--surface)",
                "surface-muted": "var(--surface-muted)",
                "surface-raised": "var(--surface-raised)",
                "theme-border": "var(--border)",
                "theme-border-strong": "var(--border-strong)",
                "theme-text": "var(--text)",
                "theme-text-muted": "var(--text-muted)",
                "theme-text-subtle": "var(--text-subtle)",
                "theme-heading": "var(--heading)",
                brand: "var(--primary)",
                "brand-hover": "var(--primary-hover)",
                "brand-active": "var(--primary-active)",
                "brand-fg": "var(--primary-fg)",
                "brand-subtle": "var(--primary-subtle)",
                // ─── Accent tokens — lilac, theme-aware ──
                accent: "var(--accent)",
                "accent-hover": "var(--accent-hover)",
                "accent-fg": "var(--accent-fg)",
                "accent-subtle": "var(--accent-subtle)",
                "focus-ring": "var(--ring)",
            },
            maxWidth: {
                container: "1240px",
            },
            boxShadow: {
                "kiva-sm": "0 2px 10px -4px rgba(42, 31, 61, 0.12)",
                kiva: "0 14px 34px -16px rgba(42, 31, 61, 0.22)",
                "kiva-lg": "0 30px 70px -24px rgba(42, 31, 61, 0.32)",
            },
            transitionTimingFunction: {
                kiva: "cubic-bezier(0.2, 0.75, 0.2, 1)",
                "kiva-bounce": "cubic-bezier(0.3, 1.15, 0.5, 1)",
            },
        },
    },
};

export default config;
