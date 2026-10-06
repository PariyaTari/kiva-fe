"use client";

import { useQuery } from "@tanstack/react-query";
import Reveal from "@/app/_components/common/reveal/reveal";
import { Icon } from "@/app/_components/icon/icons";
import { MessengerIcon } from "@/app/_components/icon/messengerIcon";
import BagArt from "@/app/_components/shop/bagArt/bagArt";
import { SiteEndpoints } from "@/app/_components/site/_api/siteEndpoints";
import { FALLBACK_CONFIG } from "@/config/site";
import { withMappedError } from "@/utils/withMappedError";

/** The design lists these three, in this order. */
const CHANNELS = ["RUBIKA", "BALE", "TELEGRAM"];

/** `.still` «جوابت رو پیدا نکردی؟» — the messengers and the support phone from the site config. */
export default function StillBox() {
	// same query as the shell's header/footer; until it answers, the design's static values
	const config = useQuery({
		queryKey: ["site", "config"],
		queryFn: () => withMappedError(() => SiteEndpoints.getConfig()),
	});
	const { social = [], support } = config.data ?? FALLBACK_CONFIG;
	const messengers = CHANNELS.map((c) => social.find((s) => s.channel === c)).filter((s) => !!s);

	return (
		<Reveal className="still">
			<div className="art">
				<BagArt type="cross" color="lilac" variant={2} />
			</div>
			<div>
				<h3>جوابت رو پیدا نکردی؟</h3>
				<p>توی پیام‌رسان یا تلفنی بپرس؛ همکارهامون با حوصله جواب می‌دن.</p>
			</div>
			<div className="msgs" id="msgs">
				{messengers.map((m) => (
					<a key={m.channel} className="msgr" href={m.url} target="_blank" rel="noopener noreferrer">
						<span className="mi">
							<MessengerIcon channel={m.channel} />
						</span>
						{m.name}
					</a>
				))}
				{support?.phone && (
					<a className="msgr" href={`tel:${support.phone}`}>
						<span className="mi" style={{ background: "var(--lilac-50)", color: "var(--purple)" }}>
							<Icon name="phone" style={{ width: 16, height: 16 }} />
						</span>
						تماس
					</a>
				)}
			</div>
		</Reveal>
	);
}
