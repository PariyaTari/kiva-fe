"use client";

import { useEffect, useState } from "react";
import classNames from "classnames";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import ErrorComponent from "@/app/_components/common/errorComponent2/errorComponent2";
import Loading from "@/app/_components/common/loading/loading";
import { Icon } from "@/app/_components/icon/icons";
import { toErrorView } from "@/utils/apiError";
import { copyText } from "@/utils/clipboard";
import { convertPersianToEnglishString, toPersianDigits } from "@/utils/digits";
import { formatDate } from "@/utils/format";
import { withMappedError } from "@/utils/withMappedError";
import { TrackEndpoints } from "../../_api/trackEndpoints";
import { ERROR_BEHAVIOUR } from "../../_utils/apiError";

const DEBOUNCE_MS = 150;

/** `section.daily#daily` — the last ten shipping days as tabs, and that day's (masked) tracking codes. */
export default function DailyCodes() {
	const [dayPick, setDayPick] = useState<string | null>(null);
	// what the box shows vs. what we query (debounced)
	const [term, setTerm] = useState("");
	const [query, setQuery] = useState("");

	useEffect(() => {
		const t = setTimeout(() => setQuery(convertPersianToEnglishString(term).trim()), DEBOUNCE_MS);
		return () => clearTimeout(t);
	}, [term]);

	const days = useQuery({
		queryKey: ["tracking", "days", 10],
		queryFn: () => withMappedError(() => TrackEndpoints.getDays(10)),
		meta: { showNotificationOnRefetch: true },
	});

	const date = dayPick ?? days.data?.[0]?.date ?? null;

	const codes = useQuery({
		queryKey: ["tracking", "daily", { date, q: query }],
		queryFn: ({ signal }) => withMappedError(() => TrackEndpoints.getDaily(date ?? "", query, signal)),
		enabled: !!date,
		placeholderData: keepPreviousData,
		meta: { showNotificationOnRefetch: true },
	});

	const daysError = toErrorView(ERROR_BEHAVIOUR, days.error, "دریافت روزهای ارسال با خطا مواجه شد.");
	const codesError = toErrorView(ERROR_BEHAVIOUR, codes.error, "دریافت کدهای رهگیری با خطا مواجه شد.");
	const list = codes.data;

	return (
		<section className="daily" id="daily">
			<div className="sec-head">
				<div>
					<span className="eyebrow">
						<Icon name="truck" /> ارسال‌های روزانه
					</span>
					<h2>کدهای رهگیری ۱۰ روز اخیر</h2>
					<p>روزی که سفارشت ارسال شده رو انتخاب کن و با ۴ رقم آخر موبایلت، کد رهگیری‌ات رو پیدا کن.</p>
				</div>
			</div>
			{days.isLoading ? (
				<Loading />
			) : !!daysError ? (
				<ErrorComponent
					retryable={daysError.retryable}
					ticketAble={daysError.ticketAble}
					errorText={daysError.errorText}
					executeFunction={() => days.refetch()}
					loading={days.isFetching}
				/>
			) : !days.error && !!days.data ? (
				<>
					<div className="days" id="days" role="tablist" aria-label="روزها">
						{days.data.map((d) => (
							<button
								key={d.date}
								type="button"
								role="tab"
								aria-selected={d.date === date}
								className={classNames("dbtn", { on: d.date === date })}
								onClick={() => setDayPick(d.date)}
							>
								<small>{d.label}</small>
								<b>{formatDate(`${d.date}T12:00:00+03:30`, { day: "numeric" })}</b>
								<small>{formatDate(`${d.date}T12:00:00+03:30`, { month: "long" })}</small>
								<em>{toPersianDigits(d.shipmentCount)} مرسوله</em>
							</button>
						))}
					</div>
					<div className="d-tools">
						<div className="s">
							<Icon name="search" />
							<input
								className="input"
								id="dq"
								placeholder="۴ رقم آخر موبایل یا حرف اول نام…"
								inputMode="search"
								aria-label="جستجو در کدهای رهگیری"
								value={term}
								onChange={(e) => setTerm(e.target.value)}
							/>
						</div>
						<span className="muted" id="dCount" style={{ fontSize: 13 }}>
							{list ? `${toPersianDigits(list.items.length)} مرسوله · ${list.label}` : ""}
						</span>
					</div>
					{codes.isLoading ? (
						<Loading />
					) : !!codesError ? (
						<ErrorComponent
							retryable={codesError.retryable}
							ticketAble={codesError.ticketAble}
							errorText={codesError.errorText}
							executeFunction={() => codes.refetch()}
							loading={codes.isFetching}
						/>
					) : !codes.error && !!list ? (
						<div className="codes" id="codes" style={codes.isPlaceholderData ? { opacity: 0.6, transition: "opacity .2s" } : undefined}>
							{list.items.length ? (
								<>
									<div className="crow head">
										<span />
										<span>نام گیرنده</span>
										<span>شهر</span>
										<span>موبایل</span>
										<span>کد رهگیری</span>
										<span />
									</div>
									{list.items.map((x, i) => (
										<div key={x.id} className="crow" style={{ animationDelay: `${i * 30}ms` }}>
											<span className="av">{x.recipientInitial}</span>
											<span>{x.recipientMasked}</span>
											<span>
												{x.city}{" "}
												<span className="tag" style={{ height: 20, fontSize: 10, padding: "0 7px" }}>
													{x.carrierName}
												</span>
											</span>
											<span className="ph">{toPersianDigits(x.phoneMasked)}</span>
											<code>{toPersianDigits(x.trackingCode)}</code>
											<button type="button" className="cp" aria-label="کپی کد" onClick={() => copyText(x.trackingCode, "کد رهگیری کپی شد")}>
												<Icon name="copy" />
											</button>
										</div>
									))}
								</>
							) : (
								<div className="d-empty">{list.emptyMessage ?? "موردی پیدا نشد. ۴ رقم آخر موبایلت رو دوباره چک کن."}</div>
							)}
						</div>
					) : null}
				</>
			) : null}
		</section>
	);
}
