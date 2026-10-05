"use client";

import Button from "@/app/_components/ui/button/button";
import { Icon } from "@/app/_components/icon/icons";
import { useUiStore } from "@/store/ui.store";

/** The 404's «جستجو» button — opens the header search sheet. */
export default function NotFoundSearch() {
	const open = useUiStore((s) => s.open);
	return (
		<Button variant="white" size="lg" iconStart={<Icon name="search" />} onClick={() => open("search")}>
			جستجو
		</Button>
	);
}
