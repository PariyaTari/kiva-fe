"use client";

import { Ref } from "react";
import classNames from "classnames";
import { Icon } from "@/app/_components/icon/icons";
import { MessengerIcon } from "@/app/_components/icon/messengerIcon";
import Input from "@/app/_components/ui/input/input";
import { MessengerOption, PhotoMessengerChannel } from "@/types/order.type";
import { digitsOnly, toPersianDigits } from "@/utils/digits";

type SignatureBlockProps = {
	blockRef: Ref<HTMLDivElement>;
	messengers: MessengerOption[];
	messenger: PhotoMessengerChannel | null;
	onMessenger: (channel: PhotoMessengerChannel) => void;
	/** `.msg-err` — pay was pressed without a messenger. */
	messengerError: boolean;
	phone: string;
	onPhone: (phone: string) => void;
	phoneError: string | null;
	note: string;
	onNote: (note: string) => void;
	/** Photo of the first cart item, inside the phone of the preview art. */
	previewImage?: string;
};

/** Block ۲ `.sig-block` «امضای کیوا» — where the pre-shipment photos go (required). */
export default function SignatureBlock({
	blockRef,
	messengers,
	messenger,
	onMessenger,
	messengerError,
	phone,
	onPhone,
	phoneError,
	note,
	onNote,
	previewImage,
}: SignatureBlockProps) {
	return (
		<div className="sig-block" id="sigBlock" ref={blockRef}>
			<span className="ribbon">
				<Icon name="sparkle" /> امضای کیوا
			</span>
			<h3>
				<span className="n">۲</span> عکس کیفت رو قبل از ارسال کجا بفرستیم؟
			</h3>
			<p>قبل از بسته‌بندی، از همون کیفی که برات کنار گذاشتیم عکس و ویدیو می‌گیریم و توی پیام‌رسان انتخابی‌ات می‌فرستیم. یه نسخه هم توی جزئیات سفارش می‌مونه.</p>
			<div className="sig-flex">
				<div>
					<div className="msg-opts" role="radiogroup" aria-label="پیام‌رسان">
						{messengers
							.filter((m) => m.enabled !== false)
							.map((m) => (
								<label key={m.channel} className="msg-opt">
									<input type="radio" name="msgr" value={m.channel} checked={messenger === m.channel} onChange={() => onMessenger(m.channel)} />
									<span className="bx">
										<MessengerIcon channel={m.channel} />
										<b>{m.name}</b>
										{m.hint && <small>{m.hint}</small>}
									</span>
									<span className="ck">
										<Icon name="check" />
									</span>
								</label>
							))}
					</div>
					<div className={classNames("msg-err", { on: messengerError })} id="msgErr" role="alert">
						یکی از پیام‌رسان‌ها رو انتخاب کن تا عکس کیفت رو برات بفرستیم.
					</div>
					<div className="sig-phone">
						<Input
							id="mPhone"
							wrapperId="mpField"
							label="شماره موبایل در این پیام‌رسان"
							direction="ltr"
							inputMode="numeric"
							maxLength={11}
							value={toPersianDigits(phone)}
							error={phoneError}
							onChange={(e) => onPhone(digitsOnly(e.target.value, 11).en)}
						/>
						<Input
							id="mNote"
							label="توضیح برای عکس"
							labelNote="اختیاری"
							placeholder="مثلاً: از داخل کیف هم عکس بگیرید"
							maxLength={200}
							value={note}
							onChange={(e) => onNote(e.target.value)}
						/>
					</div>
				</div>
				<div className="sig-prev" aria-hidden="true">
					<SigArt image={previewImage} />
				</div>
			</div>
		</div>
	);
}

/** The design's `sigArt()` — a phone showing the shopper's own bag with a «همونه! ✓✓» reply. */
function SigArt({ image }: { image?: string }) {
	return (
		<svg viewBox="0 0 170 200">
			<rect x="20" y="6" width="130" height="188" rx="22" fill="#fff" stroke="#2A1F3D" strokeWidth="3" />
			<rect x="30" y="26" width="110" height="150" rx="12" fill="#F3EEFA" />
			<rect x="38" y="36" width="84" height="74" rx="14" fill="#fff" />
			{/* the design draws the bag at translate(42 34) scale(.38) of its 200×200 art → a 76×76 box */}
			{image && <image href={image} x="42" y="34" width="76" height="76" preserveAspectRatio="xMidYMid meet" />}
			<rect x="44" y="116" width="66" height="8" rx="4" fill="#E4D9F3" />
			<rect x="72" y="134" width="60" height="22" rx="11" fill="#C8B6E2" />
			<text x="102" y="149" textAnchor="middle" fontFamily="yekanBakh, Yekan Bakh, Vazirmatn" fontSize="9" fontWeight="700" fill="#2A1F3D">
				همونه! ✓✓
			</text>
			<circle cx="140" cy="34" r="14" fill="#2F7D5B" stroke="#2A1F3D" strokeWidth="3" />
			<path d="M134 34l4 4 8-8" stroke="#fff" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	);
}
