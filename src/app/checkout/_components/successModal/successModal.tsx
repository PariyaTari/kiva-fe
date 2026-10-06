"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/app/_components/icon/icons";
import Modal from "@/app/_components/ui/modal/modal";
import { copyText } from "@/utils/clipboard";
import { toPersianDigits } from "@/utils/digits";

const CONFETTI_COLORS = ["#C8B6E2", "#5B3E8C", "#D9C4A8", "#E4D9F3", "#F5EDE3"];

type Piece = { left: number; color: string; delay: number; duration: number };

const makeConfetti = (): Piece[] =>
	Array.from({ length: 60 }, () => ({
		left: Math.random() * 100,
		color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
		delay: Math.random() * 0.8,
		duration: 2 + Math.random() * 1.5,
	}));

type SuccessModalProps = {
	orderCode: string;
	nextSteps: string[];
	/** Closing the modal leads to the order list (design `onClose`). */
	onClose: () => void;
};

/** «سفارشت با موفقیت ثبت شد!» — the design's success modal, with a burst of `.confetti` behind it. */
export default function SuccessModal({ orderCode, nextSteps, onClose }: SuccessModalProps) {
	const [open, setOpen] = useState(true);
	// only ever rendered after a client-side answer (never on the server), so random positions are safe here
	const [pieces, setPieces] = useState<Piece[]>(makeConfetti);

	useEffect(() => {
		const timer = setTimeout(() => setPieces([]), 4000);
		return () => clearTimeout(timer);
	}, []);

	const close = () => {
		setOpen(false);
		onClose();
	};

	return (
		<>
			{!!pieces.length && (
				<div className="confetti" aria-hidden="true">
					{pieces.map((p, i) => (
						<i key={i} style={{ left: `${p.left}%`, background: p.color, animationDelay: `${p.delay}s`, animationDuration: `${p.duration}s` }} />
					))}
				</div>
			)}
			<Modal open={open} onClose={close}>
				<div className="success">
					<div className="ck">
						<Icon name="check" />
					</div>
					<h3>سفارشت با موفقیت ثبت شد!</h3>
					<p className="muted" style={{ fontSize: 13.5 }}>
						ممنون که کیوا رو انتخاب کردی
					</p>
					<div className="ord">
						{orderCode}
						<button type="button" aria-label="کپی" onClick={() => copyText(orderCode, "شماره سفارش کپی شد")}>
							<Icon name="copy" />
						</button>
					</div>
					<div className="next">
						{nextSteps.map((step, i) => (
							<div key={i}>
								<span className="nn">{toPersianDigits(i + 1)}</span>
								<span>{step}</span>
							</div>
						))}
					</div>
					<div style={{ display: "grid", gap: 10 }}>
						<Link className="btn btn-primary btn-block" href="/account/orders">
							مشاهده سفارش
						</Link>
						<Link className="btn btn-outline btn-block" href="/products">
							ادامه خرید
						</Link>
					</div>
				</div>
			</Modal>
		</>
	);
}
