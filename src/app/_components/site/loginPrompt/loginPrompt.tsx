"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Modal from "@/app/_components/ui/modal/modal";
import { Icon } from "@/app/_components/icon/icons";
import BagArt from "@/app/_components/shop/bagArt/bagArt";
import Button from "@/app/_components/ui/button/button";
import { useUiStore } from "@/store/ui.store";

/** «اول وارد شو» — what guests see when an action needs an account (design `K.needLogin`). */
export default function LoginPrompt() {
	const message = useUiStore((s) => s.loginPrompt);
	const close = useUiStore((s) => s.closeLoginPrompt);
	const pathname = usePathname();
	const search = useSearchParams().toString();
	const next = encodeURIComponent(pathname + (search ? `?${search}` : ""));

	return (
		<Modal open={!!message} onClose={close}>
			<div style={{ textAlign: "center", padding: "6px 4px" }}>
				<div style={{ width: 120, margin: "0 auto 10px" }}>
					<BagArt type="cross" color="lilac" variant={2} />
				</div>
				<h3>اول وارد شو</h3>
				<p className="muted" style={{ margin: "6px 0 20px" }}>
					{message}
				</p>
				<Button href={`/login?next=${next}`} fullWidth onClick={close} iconStart={<Icon name="phone" />}>
					ورود با شماره موبایل
				</Button>
				<p className="muted" style={{ fontSize: 12.5, marginTop: 12 }}>
					بدون رمز عبور، فقط با کد یک‌بارمصرف
				</p>
			</div>
		</Modal>
	);
}
