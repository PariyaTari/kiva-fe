"use client";

import { Icon } from "@/app/_components/icon/icons";
import { copyText } from "@/utils/clipboard";

/** «کپی» of a tracking code (`btn-white`). */
export default function CopyButton({ text }: { text: string }) {
	return (
		<button type="button" className="btn btn-white btn-sm" onClick={() => copyText(text, "کد رهگیری کپی شد")}>
			<Icon name="copy" /> کپی
		</button>
	);
}
