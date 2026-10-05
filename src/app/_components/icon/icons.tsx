"use client";

import { BaseIcon } from "./base-icon";
import { svgIcon } from "./icon.types";

/**
 * Line-style icon set of the Kiva design system.
 * All icons share the same 24×24 grid, 1.7 stroke weight and round joins
 * so they read as one family across the shell and content.
 * Directional names are literal (an "ArrowLeft" points left — the forward direction in RTL).
 */

// ─────────────────────────── shell & navigation ───────────────────────────

export const IconSearch = (p: svgIcon) => (
	<BaseIcon {...p}>
		<circle cx="11" cy="11" r="7" />
		<path d="M20 20l-3.5-3.5" />
	</BaseIcon>
);

export const IconHeart = (p: svgIcon) => (
	<BaseIcon {...p}>
		<path d="M12 20s-7-4.4-9.2-9C1.4 8 3 4.5 6.5 4.5c2 0 3.5 1.2 5.5 3.3 2-2.1 3.5-3.3 5.5-3.3C21 4.5 22.6 8 21.2 11c-2.2 4.6-9.2 9-9.2 9z" />
	</BaseIcon>
);

export const IconUser = (p: svgIcon) => (
	<BaseIcon {...p}>
		<circle cx="12" cy="8" r="4" />
		<path d="M4 20c1.5-3.5 4.5-5 8-5s6.5 1.5 8 5" />
	</BaseIcon>
);

export const IconBag = (p: svgIcon) => (
	<BaseIcon {...p}>
		<path d="M5.5 8h13l-.9 11.1a1.5 1.5 0 01-1.5 1.4H7.9a1.5 1.5 0 01-1.5-1.4L5.5 8z" />
		<path d="M9 10V6.5a3 3 0 016 0V10" />
	</BaseIcon>
);

export const IconMenu = (p: svgIcon) => (
	<BaseIcon {...p}>
		<path d="M4 7h16M4 12h16M10 17h10" />
	</BaseIcon>
);

export const IconClose = (p: svgIcon) => (
	<BaseIcon {...p}>
		<path d="M6 6l12 12M18 6L6 18" />
	</BaseIcon>
);

export const IconHome = (p: svgIcon) => (
	<BaseIcon {...p}>
		<path d="M4 11l8-7 8 7v8a1 1 0 01-1 1h-4v-6h-6v6H5a1 1 0 01-1-1v-8z" />
	</BaseIcon>
);

export const IconGrid = (p: svgIcon) => (
	<BaseIcon {...p}>
		<rect x="4" y="4" width="7" height="7" rx="2" />
		<rect x="13" y="4" width="7" height="7" rx="2" />
		<rect x="4" y="13" width="7" height="7" rx="2" />
		<rect x="13" y="13" width="7" height="7" rx="2" />
	</BaseIcon>
);

export const IconLogout = (p: svgIcon) => (
	<BaseIcon {...p}>
		<path d="M15 4h3a2 2 0 012 2v12a2 2 0 01-2 2h-3M10 8l-4 4 4 4M6 12h10" />
	</BaseIcon>
);

// ─────────────────────────── arrows & chevrons ───────────────────────────

export const IconArrowLeft = (p: svgIcon) => (
	<BaseIcon {...p}>
		<path d="M19 12H5M11 6l-6 6 6 6" />
	</BaseIcon>
);

export const IconArrowRight = (p: svgIcon) => (
	<BaseIcon {...p}>
		<path d="M5 12h14M13 6l6 6-6 6" />
	</BaseIcon>
);

export const IconChevronDown = (p: svgIcon) => (
	<BaseIcon {...p}>
		<path d="M6 9l6 6 6-6" />
	</BaseIcon>
);

export const IconChevronLeft = (p: svgIcon) => (
	<BaseIcon {...p}>
		<path d="M15 6l-6 6 6 6" />
	</BaseIcon>
);

export const IconChevronRight = (p: svgIcon) => (
	<BaseIcon {...p}>
		<path d="M9 6l6 6-6 6" />
	</BaseIcon>
);

// ─────────────────────────── actions ───────────────────────────

export const IconPlus = (p: svgIcon) => (
	<BaseIcon {...p}>
		<path d="M12 5v14M5 12h14" />
	</BaseIcon>
);

export const IconMinus = (p: svgIcon) => (
	<BaseIcon {...p}>
		<path d="M5 12h14" />
	</BaseIcon>
);

export const IconTrash = (p: svgIcon) => (
	<BaseIcon {...p}>
		<path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 002 2h6a2 2 0 002-2l1-12M9 7V4h6v3" />
	</BaseIcon>
);

export const IconCheck = (p: svgIcon) => (
	<BaseIcon {...p}>
		<path d="M5 12.5l4.5 4.5L19 7.5" />
	</BaseIcon>
);

export const IconEdit = (p: svgIcon) => (
	<BaseIcon {...p}>
		<path d="M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4" />
	</BaseIcon>
);

export const IconCopy = (p: svgIcon) => (
	<BaseIcon {...p}>
		<rect x="8" y="8" width="12" height="12" rx="2.5" />
		<path d="M16 8V6a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2h2" />
	</BaseIcon>
);

export const IconShare = (p: svgIcon) => (
	<BaseIcon {...p}>
		<circle cx="18" cy="5" r="2.5" />
		<circle cx="6" cy="12" r="2.5" />
		<circle cx="18" cy="19" r="2.5" />
		<path d="M8.2 10.8l7.6-4.4M8.2 13.2l7.6 4.4" />
	</BaseIcon>
);

export const IconSend = (p: svgIcon) => (
	<BaseIcon {...p}>
		<path d="M21 3L10 14M21 3l-7 18-4-7-7-4 18-7z" />
	</BaseIcon>
);

export const IconRefresh = (p: svgIcon) => (
	<BaseIcon {...p}>
		<path d="M4 12a8 8 0 0114-5.3L20 9M20 4v5h-5M20 12a8 8 0 01-14 5.3L4 15M4 20v-5h5" />
	</BaseIcon>
);

export const IconFilter = (p: svgIcon) => (
	<BaseIcon {...p}>
		<path d="M4 6h16M7 12h10M10 18h4" />
	</BaseIcon>
);

export const IconSort = (p: svgIcon) => (
	<BaseIcon {...p}>
		<path d="M7 4v16M4 7l3-3 3 3M17 20V4M14 17l3 3 3-3" />
	</BaseIcon>
);

export const IconEye = (p: svgIcon) => (
	<BaseIcon {...p}>
		<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
		<circle cx="12" cy="12" r="3" />
	</BaseIcon>
);

export const IconEyeOff = (p: svgIcon) => (
	<BaseIcon {...p}>
		<path d="M10.6 6.1A9.7 9.7 0 0112 6c6.5 0 10 6 10 6a13.6 13.6 0 01-2.2 2.7M6.6 6.6A13.6 13.6 0 002 12s3.5 6 10 6a9.5 9.5 0 003.4-.6" />
		<path d="M9.9 9.9a3 3 0 004.2 4.2M3 3l18 18" />
	</BaseIcon>
);

// ─────────────────────────── commerce & delivery ───────────────────────────

export const IconCamera = (p: svgIcon) => (
	<BaseIcon {...p}>
		<path d="M4 8.5A2.5 2.5 0 016.5 6h1.8l1.4-2h4.6l1.4 2h1.8A2.5 2.5 0 0120 8.5v9a2.5 2.5 0 01-2.5 2.5h-11A2.5 2.5 0 014 17.5v-9z" />
		<circle cx="12" cy="13" r="3.5" />
	</BaseIcon>
);

export const IconTruck = (p: svgIcon) => (
	<BaseIcon {...p}>
		<path d="M3 6.5A1.5 1.5 0 014.5 5H14v11H3V6.5zM14 9h4l3 3.5V16h-7" />
		<circle cx="7" cy="17.5" r="1.8" />
		<circle cx="17" cy="17.5" r="1.8" />
	</BaseIcon>
);

export const IconBox = (p: svgIcon) => (
	<BaseIcon {...p}>
		<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" />
		<path d="M4 7.5l8 4.5 8-4.5M12 12v9" />
	</BaseIcon>
);

export const IconPackage = (p: svgIcon) => (
	<BaseIcon {...p}>
		<path d="M3.5 7.5L12 3l8.5 4.5v9L12 21l-8.5-4.5z" />
		<path d="M8 5.3l8.5 4.5V13" />
	</BaseIcon>
);

export const IconTimer = (p: svgIcon) => (
	<BaseIcon {...p}>
		<circle cx="12" cy="13" r="8" />
		<path d="M12 9v4l2.5 2.5M9 2h6" />
	</BaseIcon>
);

export const IconTag = (p: svgIcon) => (
	<BaseIcon {...p}>
		<path d="M3 12V4.5A1.5 1.5 0 014.5 3H12l9 9-9 9-9-9z" />
		<circle cx="7.5" cy="7.5" r="1.5" />
	</BaseIcon>
);

export const IconCreditCard = (p: svgIcon) => (
	<BaseIcon {...p}>
		<rect x="3" y="5" width="18" height="14" rx="2.5" />
		<path d="M3 10h18M7 15h4" />
	</BaseIcon>
);

export const IconRuler = (p: svgIcon) => (
	<BaseIcon {...p}>
		<path d="M3 17L17 3l4 4L7 21l-4-4zM7 13l2 2M10 10l2 2M13 7l2 2" />
	</BaseIcon>
);

export const IconShieldCheck = (p: svgIcon) => (
	<BaseIcon {...p}>
		<path d="M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6l7-3z" />
		<path d="M9 12l2 2 4-4" />
	</BaseIcon>
);

export const IconLock = (p: svgIcon) => (
	<BaseIcon {...p}>
		<rect x="5" y="10" width="14" height="10" rx="2.5" />
		<path d="M8 10V7a4 4 0 018 0v3" />
	</BaseIcon>
);

export const IconAward = (p: svgIcon) => (
	<BaseIcon {...p}>
		<circle cx="12" cy="9" r="5.5" />
		<path d="M8.5 13.5L7 21l5-2.5 5 2.5-1.5-7.5" />
	</BaseIcon>
);

export const IconStar = (p: svgIcon) => (
	<BaseIcon {...p}>
		<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8L3.5 9.7l5.9-.9L12 3.5z" />
	</BaseIcon>
);

export const IconFlame = (p: svgIcon) => (
	<BaseIcon {...p}>
		<path d="M12 21c4 0 7-2.7 7-6.5 0-4-3.5-6-4.5-10-2 1.5-3.5 3.5-3.5 6-1-1-2-2-2.5-3.5C6 9 5 11.5 5 14.5 5 18.3 8 21 12 21z" />
	</BaseIcon>
);

export const IconSparkle = (p: svgIcon) => (
	<BaseIcon {...p}>
		<path d="M12 3c.6 4.6 2.4 6.4 7 7-4.6.6-6.4 2.4-7 7-.6-4.6-2.4-6.4-7-7 4.6-.6 6.4-2.4 7-7z" />
	</BaseIcon>
);

export const IconLeaf = (p: svgIcon) => (
	<BaseIcon {...p}>
		<path d="M5 19c0-9 6-14 15-14 0 9-5 15-14 15M5 19l7-7" />
	</BaseIcon>
);

export const IconFeather = (p: svgIcon) => (
	<BaseIcon {...p}>
		<path d="M20 4c-8 0-14 6-14 14M6 18l-2 2M20 4c0 7-4 12-11 12" />
	</BaseIcon>
);

// ─────────────────────────── media ───────────────────────────

export const IconImage = (p: svgIcon) => (
	<BaseIcon {...p}>
		<rect x="3" y="4" width="18" height="16" rx="3" />
		<circle cx="9" cy="10" r="2" />
		<path d="M21 16l-5-5-9 9" />
	</BaseIcon>
);

export const IconVideo = (p: svgIcon) => (
	<BaseIcon {...p}>
		<rect x="3" y="6" width="13" height="12" rx="2.5" />
		<path d="M16 10.5l5-3v9l-5-3" />
	</BaseIcon>
);

export const IconPlay = (p: svgIcon) => (
	<BaseIcon {...p}>
		<path d="M8 5.5v13a1 1 0 001.5.9l10.5-6.5a1 1 0 000-1.8L9.5 4.6A1 1 0 008 5.5z" fill="currentColor" stroke="none" />
	</BaseIcon>
);

// ─────────────────────────── contact & support ───────────────────────────

export const IconPhone = (p: svgIcon) => (
	<BaseIcon {...p}>
		<path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a1 1 0 01-1 1A16 16 0 014 5a1 1 0 011-1z" />
	</BaseIcon>
);

export const IconMail = (p: svgIcon) => (
	<BaseIcon {...p}>
		<rect x="3" y="5" width="18" height="14" rx="2.5" />
		<path d="M4 7l8 6 8-6" />
	</BaseIcon>
);

export const IconMapPin = (p: svgIcon) => (
	<BaseIcon {...p}>
		<path d="M12 21s-7-6.2-7-11.5A7 7 0 0112 2.5a7 7 0 017 7C19 14.8 12 21 12 21z" />
		<circle cx="12" cy="9.5" r="2.5" />
	</BaseIcon>
);

export const IconClock = (p: svgIcon) => (
	<BaseIcon {...p}>
		<circle cx="12" cy="12" r="9" />
		<path d="M12 7v5l3 2" />
	</BaseIcon>
);

export const IconCalendar = (p: svgIcon) => (
	<BaseIcon {...p}>
		<rect x="3" y="5" width="18" height="16" rx="2.5" />
		<path d="M3 10h18M8 3v4M16 3v4" />
	</BaseIcon>
);

export const IconChat = (p: svgIcon) => (
	<BaseIcon {...p}>
		<path d="M4 5.5A1.5 1.5 0 015.5 4h13A1.5 1.5 0 0120 5.5v9a1.5 1.5 0 01-1.5 1.5H9l-5 4V5.5z" />
	</BaseIcon>
);

export const IconHeadset = (p: svgIcon) => (
	<BaseIcon {...p}>
		<path d="M4 15v-3a8 8 0 0116 0v3" />
		<rect x="3" y="14" width="4" height="6" rx="1.5" />
		<rect x="17" y="14" width="4" height="6" rx="1.5" />
	</BaseIcon>
);

export const IconBell = (p: svgIcon) => (
	<BaseIcon {...p}>
		<path d="M6 10a6 6 0 0112 0c0 5 2 6 2 6H4s2-1 2-6M10 19a2 2 0 004 0" />
	</BaseIcon>
);

export const IconQuote = (p: svgIcon) => (
	<BaseIcon {...p}>
		<path d="M10 7H6a2 2 0 00-2 2v4h6V7zM20 7h-4a2 2 0 00-2 2v4h6V7zM4 13c0 3 1 4 3 5M14 13c0 3 1 4 3 5" />
	</BaseIcon>
);

export const IconSmile = (p: svgIcon) => (
	<BaseIcon {...p}>
		<circle cx="12" cy="12" r="9" />
		<path d="M8.5 14.5c1.8 2 5.2 2 7 0M9 9.5h.01M15 9.5h.01" />
	</BaseIcon>
);

// ─────────────────────────── status & feedback ───────────────────────────

export const IconInfo = (p: svgIcon) => (
	<BaseIcon {...p}>
		<circle cx="12" cy="12" r="9" />
		<path d="M12 11v5M12 8h.01" />
	</BaseIcon>
);

export const IconCircleCheck = (p: svgIcon) => (
	<BaseIcon {...p}>
		<circle cx="12" cy="12" r="9" />
		<path d="M8.5 12.2l2.5 2.5 4.5-5" />
	</BaseIcon>
);

export const IconAlertCircle = (p: svgIcon) => (
	<BaseIcon {...p}>
		<circle cx="12" cy="12" r="9" />
		<path d="M12 8v5M12 16h.01" />
	</BaseIcon>
);

export const IconAlertTriangle = (p: svgIcon) => (
	<BaseIcon {...p}>
		<path d="M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" />
		<path d="M12 9v4M12 17h.01" />
	</BaseIcon>
);

// ─────────────────────────── theme ───────────────────────────

export const IconSun = (p: svgIcon) => (
	<BaseIcon {...p}>
		<circle cx="12" cy="12" r="4" />
		<path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
	</BaseIcon>
);

export const IconMoon = (p: svgIcon) => (
	<BaseIcon {...p}>
		<path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z" />
	</BaseIcon>
);

// ─────────────────────────── messengers & social (mono, 32×32 grid) ───────────────────────────

export const IconTelegram = (p: svgIcon) => (
	<BaseIcon viewBox="0 0 32 32" {...p}>
		<path
			fill="currentColor"
			stroke="none"
			d="M5.6 15.2l18.6-7.2c.9-.3 1.6.2 1.3 1.5l-3.2 15c-.2 1.1-.9 1.4-1.8.9l-5-3.7-2.4 2.3c-.3.3-.5.5-1 .5l.4-5.1 9.2-8.3c.4-.4-.1-.6-.6-.2l-11.4 7.2-4.9-1.5c-1.1-.3-1.1-1 .2-1.4z"
		/>
	</BaseIcon>
);

export const IconInstagram = (p: svgIcon) => (
	<BaseIcon viewBox="0 0 32 32" strokeWidth="2.2" {...p}>
		<rect x="6" y="6" width="20" height="20" rx="6" />
		<circle cx="16" cy="16" r="4.6" />
		<circle cx="21.6" cy="10.4" r="1" fill="currentColor" stroke="none" />
	</BaseIcon>
);

export const IconBale = (p: svgIcon) => (
	<BaseIcon viewBox="0 0 32 32" strokeWidth="2.2" {...p}>
		<path d="M16 6.5a9.5 9.5 0 018.3 14.1l1.4 5-5.1-1.3A9.5 9.5 0 1116 6.5z" />
		<path d="M11.5 16.2l3 3 6-6.2" />
	</BaseIcon>
);

export const IconRubika = (p: svgIcon) => (
	<BaseIcon viewBox="0 0 32 32" strokeWidth="2.2" {...p}>
		<path d="M16 5l9.5 5.5v11L16 27l-9.5-5.5v-11z" />
		<path d="M16 11l4.8 2.7v5.6L16 22l-4.8-2.7v-5.6z" />
	</BaseIcon>
);
