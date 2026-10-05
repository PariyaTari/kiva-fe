"use client";

import { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNotificationStore } from "@/store/notification.store";
import { NotificationType } from "@/types/notification.type";
import {
	IconAlertCircle,
	IconAlertTriangle,
	IconCircleCheck,
	IconClose,
	IconInfo,
} from "@/app/_components/icon/icons";

/** Icon tint per type — light tints, since the Kiva toast is a dark ink pill. */
const TONES: Record<NotificationType, string> = {
	success: "text-success-100",
	error: "text-danger-100",
	warning: "text-warning-100",
	info: "text-primary-300",
};

const ICONS: Record<NotificationType, ReactNode> = {
	success: <IconCircleCheck width={17} height={17} />,
	error: <IconAlertCircle width={17} height={17} />,
	warning: <IconAlertTriangle width={17} height={17} />,
	info: <IconInfo width={17} height={17} />,
};

export default function Notifications() {
	const notifications = useNotificationStore((state) => state.notifications);
	const dismiss = useNotificationStore((state) => state.dismissNotification);

	return (
		<div className="pointer-events-none fixed bottom-6 left-1/2 z-[200] flex w-max max-w-[calc(100vw-32px)] -translate-x-1/2 flex-col items-center gap-2.5">
			<AnimatePresence initial={false}>
				{notifications.map((n) => (
					<motion.div
						key={n.id}
						layout
						role={n.type === "error" ? "alert" : "status"}
						initial={{ opacity: 0, y: 20, scale: 0.9 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: 10, scale: 0.95 }}
						transition={{ type: "spring", stiffness: 420, damping: 30 }}
						className="pointer-events-auto flex items-center gap-3 rounded-full bg-primary-900 py-2.5 pl-2.5 pr-3 text-white shadow-kiva-lg dark:border dark:border-theme-border-strong dark:bg-surface-raised dark:text-theme-text"
					>
						<span className={`grid h-[30px] w-[30px] shrink-0 place-items-center rounded-full bg-white/15 ${TONES[n.type]}`}>
							{ICONS[n.type]}
						</span>
						<p className="text-[13.5px] font-medium leading-6">{n.message}</p>
						<button
							onClick={() => dismiss(n.id)}
							aria-label="بستن"
							className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white dark:text-theme-text-subtle dark:hover:text-theme-text"
						>
							<IconClose width={16} height={16} />
						</button>
					</motion.div>
				))}
			</AnimatePresence>
		</div>
	);
}
