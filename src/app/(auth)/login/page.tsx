"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Logo from "@/app/_components/common/logo/logo";
import { useAuthStore } from "@/store/auth.store";
import { useCartStore } from "@/store/cart.store";
import { AuthResponse } from "@/types/user.type";
import AuthArt from "../_components/authArt/authArt";
import { SentCode } from "../_types/auth.type";
import DoneStep from "./_components/doneStep/doneStep";
import NameStep from "./_components/nameStep/nameStep";
import OtpStep from "./_components/otpStep/otpStep";
import PhoneStep from "./_components/phoneStep/phoneStep";

type LoginStep = "phone" | "otp" | "name" | "done";

/** Only same-site paths — `?next=//evil.com` must never become an open redirect. */
const safeNext = (value: string | null) => (value && value.startsWith("/") && !value.startsWith("//") ? value : "/account");

/** `/login?next=…` — phone → OTP → (new shoppers) name → done, then back to `next` (design `login.html`). */
export default function LoginPage() {
	const router = useRouter();
	const next = safeNext(useSearchParams().get("next"));
	const hydrated = useAuthStore((s) => s.hydrated);
	const signedIn = useAuthStore((s) => !!s.accessToken);
	const setSession = useAuthStore((s) => s.setSession);

	const [step, setStep] = useState<LoginStep>("phone");
	const [phone, setPhone] = useState("");
	const [sent, setSent] = useState<SentCode | null>(null);
	const [name, setName] = useState("");

	// already signed in → straight on (only before this visit's own login started)
	useEffect(() => {
		if (hydrated && signedIn && step === "phone") router.replace(next);
	}, [hydrated, signedIn, step, next, router]);

	const finish = (displayName: string) => {
		setName(displayName);
		setStep("done");
		setTimeout(() => router.replace(next), 1400);
	};

	const verified = (res: AuthResponse) => {
		// the guest cart was merged into the account's cart (`cart` stays null until the backend's cart phase — then keep it)
		if (res.cart) useCartStore.getState().setGuestToken(null);
		// cart, hearts, prices… everything now belongs to the signed-in shopper — `SessionProvider` re-fetches it
		setSession(res.accessToken, res.user);
		setTimeout(() => (res.isNewUser && !res.user.firstName ? setStep("name") : finish(res.user.firstName ?? "")), 450);
	};

	return (
		<main className="auth">
			<div className="container auth-grid">
				<AuthArt />
				<div className="auth-card">
					<Logo className="logo" />
					{step === "phone" && (
						<PhoneStep
							initialPhone={phone}
							onSent={(value, res) => {
								setPhone(value);
								setSent(res);
								setStep("otp");
							}}
						/>
					)}
					{step === "otp" && sent && <OtpStep phone={phone} sent={sent} onEdit={() => setStep("phone")} onVerified={verified} />}
					{step === "name" && <NameStep onDone={finish} />}
					{step === "done" && <DoneStep name={name} />}
				</div>
			</div>
		</main>
	);
}
