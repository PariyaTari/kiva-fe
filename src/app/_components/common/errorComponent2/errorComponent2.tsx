"use client";

import Link from "next/link";
import classNames from "classnames";
import { Icon } from "@/app/_components/icon/icons";
import { ErrorComponentProps } from "./errorComponent2.type";

const COMPACT_BELOW = 72;
/** «ثبت تیکت» of the storefront — the contact form with the «سایر» topic. */
const TICKET_HREF = "/contact?topic=OTHER";

/** Inline error block of a failed query (error-ui standard) — buttons come from `toErrorView`. */
export default function ErrorComponent2({
	retryable,
	ticketAble,
	errorText,
	executeFunction,
	variant = "bordered",
	height,
	loading = false,
}: ErrorComponentProps) {
	if (height !== undefined && height < COMPACT_BELOW) {
		return (
			<div className="kv-err bar" role="alert" style={{ minHeight: height }}>
				<span className="ei">
					<Icon name="info" />
				</span>
				<p>{errorText}</p>
				<span className="acts">
					{retryable && (
						<button type="button" className="icon-btn" onClick={executeFunction} disabled={loading} aria-label="تلاش مجدد" title="تلاش مجدد">
							<Icon name="refresh" />
						</button>
					)}
					{ticketAble && (
						<Link className="icon-btn" href={TICKET_HREF} aria-label="گزارش به پشتیبانی" title="گزارش به پشتیبانی">
							<Icon name="headset" />
						</Link>
					)}
				</span>
			</div>
		);
	}

	return (
		<div className={classNames("kv-err", { bordered: variant === "bordered" })} role="alert" style={height ? { minHeight: height } : undefined}>
			<span className="ei">
				<Icon name="info" />
			</span>
			<p>{errorText}</p>
			{(retryable || ticketAble) && (
				<div className="acts">
					{retryable && (
						<button type="button" className={classNames("btn btn-primary btn-sm", { loading })} onClick={executeFunction} disabled={loading}>
							<Icon name="refresh" /> تلاش مجدد
						</button>
					)}
					{ticketAble && (
						<Link className="btn btn-outline btn-sm" href={TICKET_HREF}>
							<Icon name="headset" /> گزارش به پشتیبانی
						</Link>
					)}
				</div>
			)}
		</div>
	);
}
