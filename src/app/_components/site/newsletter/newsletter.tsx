"use client";

import { FormEvent, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import Reveal from "@/app/_components/common/reveal/reveal";
import { SiteEndpoints } from "@/app/_components/site/_api/siteEndpoints";
import { toast } from "@/store/notification.store";
import { withMappedError } from "@/utils/withMappedError";

const EMAIL = /^\S+@\S+\.\S+$/;

function NewsArt() {
	return (
		<svg viewBox="0 0 120 120" fill="none" aria-hidden="true">
			<rect x="6" y="6" width="108" height="108" rx="28" fill="#fff" stroke="#D9C4A8" />
			<rect x="30" y="40" width="60" height="42" rx="8" stroke="#5B3E8C" strokeWidth="2" />
			<path d="M32 44l28 20 28-20" stroke="#5B3E8C" strokeWidth="2" strokeLinejoin="round" />
			<circle cx="88" cy="40" r="9" fill="#5B3E8C" />
			<path d="M84.5 40l2.5 2.5 4.5-4.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	);
}

/** `.kv-news` — the cream newsletter box that overlaps the footer. */
export default function Newsletter() {
	const [email, setEmail] = useState("");

	const subscribe = useMutation({
		mutationFn: (value: string) => withMappedError(() => SiteEndpoints.subscribeNewsletter(value)),
		meta: { showNotification: true },
		onSuccess: (data) => {
			setEmail("");
			toast(data.message, { icon: "mail" });
		},
	});

	const submit = (e: FormEvent) => {
		e.preventDefault();
		if (!EMAIL.test(email.trim())) {
			toast("یه ایمیل درست وارد کن", { icon: "info" });
			return;
		}
		subscribe.mutate(email.trim());
	};

	return (
		<Reveal className="container kv-news-wrap">
			<div className="kv-news">
				<div className="art">
					<NewsArt />
				</div>
				<div>
					<h3>اول از همه باخبر شو</h3>
					<p>کالکشن‌های جدید، تخفیف‌های خصوصی و کدهای هدیه رو زودتر از همه دریافت کن.</p>
				</div>
				<form id="kvNewsForm" noValidate onSubmit={submit}>
					<input
						className="input ltr"
						type="email"
						placeholder="ایمیلت رو وارد کن"
						aria-label="ایمیل"
						required
						value={email}
						onChange={(e) => setEmail(e.target.value)}
					/>
					<button className={subscribe.isPending ? "btn btn-primary loading" : "btn btn-primary"} type="submit">
						عضویت
					</button>
				</form>
			</div>
		</Reveal>
	);
}
