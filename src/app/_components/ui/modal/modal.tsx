"use client";

import { ReactNode, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { IconClose } from "@/app/_components/icon/icons";

type ModalProps = {
	open: boolean;
	onClose: () => void;
	title?: string;
	children: ReactNode;
	width?: number;
};

export default function Modal({ open, onClose, title, children, width = 520 }: ModalProps) {
	useEffect(() => {
		if (!open) return;
		const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
		document.addEventListener("keydown", onKey);
		document.body.style.overflow = "hidden";
		return () => {
			document.removeEventListener("keydown", onKey);
			document.body.style.overflow = "";
		};
	}, [open, onClose]);

	return (
		<AnimatePresence>
			{open && (
				<div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={onClose}
						className="absolute inset-0 bg-primary-900/40 backdrop-blur-[6px]"
					/>
					<motion.div
						role="dialog"
						aria-modal="true"
						aria-label={title}
						initial={{ opacity: 0, scale: 0.97, y: 24 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.97, y: 24 }}
						transition={{ duration: 0.45, ease: [0.2, 0.75, 0.2, 1] }}
						style={{ maxWidth: width }}
						className="kiva-scroll relative z-10 max-h-[calc(100vh-32px)] w-full overflow-auto rounded-3xl border border-theme-border bg-surface shadow-kiva-lg"
					>
						{title ? (
							<div className="flex items-center justify-between gap-4 border-b border-theme-border px-6 py-4 sm:px-7">
								<h3 className="text-[19px] font-bold text-theme-heading">{title}</h3>
								<button
									onClick={onClose}
									aria-label="بستن"
									className="grid h-[42px] w-[42px] shrink-0 place-items-center rounded-full text-theme-text transition-colors hover:bg-surface-muted"
								>
									<IconClose width={22} height={22} />
								</button>
							</div>
						) : (
							<button
								onClick={onClose}
								aria-label="بستن"
								className="absolute left-3.5 top-3.5 grid h-[42px] w-[42px] place-items-center rounded-full text-theme-text transition-colors hover:bg-surface-muted"
							>
								<IconClose width={22} height={22} />
							</button>
						)}
						<div className="p-6 sm:p-7">{children}</div>
					</motion.div>
				</div>
			)}
		</AnimatePresence>
	);
}
