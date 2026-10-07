import { CSSProperties, Ref, useRef } from "react";
import classNames from "classnames";
import { Icon } from "@/app/_components/icon/icons";
import { ReturnReason } from "@/types/order.type";
import { toPersianDigits } from "@/utils/digits";
import { pad2 } from "@/utils/format";
import { ReturnPayer } from "../../_utils/orderActions";
import { MAX_UPLOADS, UploadTile } from "../../_utils/returnForm";

const DESC_MAX = 1000;
const ACCEPT = "image/jpeg,image/png,image/webp,video/mp4";
const PREVIEW: CSSProperties = { width: "100%", height: "100%", objectFit: "cover", borderRadius: 10, display: "block" };

type ReturnProofBlockProps = {
	blockRef: Ref<HTMLDivElement>;
	reason: ReturnReason | null;
	payer: ReturnPayer | undefined;
	description: string;
	onDescription: (value: string) => void;
	/** Field error (too short for «دلیل دیگه», or the server's `description` error). */
	descriptionError: string | null;
	tiles: UploadTile[];
	onAdd: (files: File[]) => void;
	onRemove: (id: string) => void;
	onDuration: (id: string, seconds: number) => void;
};

/** Block ۳ «عکس و توضیح» — description and up to six photo / video tiles that upload as soon as they're picked. */
export default function ReturnProofBlock(props: ReturnProofBlockProps) {
	const { blockRef, reason, payer, description, onDescription, descriptionError, tiles, onAdd, onRemove, onDuration } = props;
	const input = useRef<HTMLInputElement>(null);

	return (
		<div ref={blockRef} className="block">
			<h3>
				<span className="n">۳</span> عکس و توضیح
			</h3>
			<p className="sub">
				{payer === "KIVA" ? "از ایراد یا تفاوت عکس بگیر؛ بررسی‌اش خیلی سریع‌تر می‌شه." : "اگه چیزی هست که باید بدونیم، بنویس؛ عکس هم کمک می‌کنه."}
			</p>
			<div className={classNames("field", { error: !!descriptionError })}>
				<label htmlFor="rDesc">
					توضیح <span className="opt">{reason === "OTHER" ? "(لازم)" : "(اختیاری)"}</span>
				</label>
				<textarea
					className="textarea"
					id="rDesc"
					maxLength={DESC_MAX}
					style={{ minHeight: 96 }}
					placeholder="مثلاً: رنگ کیف با عکس قبل از ارسال فرق داشت و یه خط روی دسته‌ش هست."
					value={description}
					onChange={(e) => onDescription(e.target.value)}
				/>
				<div className={classNames("tcount", { over: description.length > DESC_MAX })}>
					<span className="err">{descriptionError}</span>
					<span>
						{toPersianDigits(description.length)}/{toPersianDigits(DESC_MAX)}
					</span>
				</div>
			</div>
			<div style={{ marginTop: 16 }}>
				<div className="m-lb" style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>
					عکس یا ویدیو{" "}
					<span className="muted" style={{ fontWeight: 400, fontSize: 12 }}>
						(تا ۶ فایل)
					</span>
				</div>
				<div className="up-grid">
					{tiles.map((t) =>
						t.status === "err" ? (
							<div key={t.id} className="up err">
								<Icon name="alert" />
								<span>{t.error}</span>
								<button type="button" className="x" aria-label="حذف" onClick={() => onRemove(t.id)}>
									<Icon name="close" />
								</button>
							</div>
						) : (
							<div key={t.id} className={classNames("up", { busy: t.status === "busy" })} style={{ "--p": `${t.progress}%` } as CSSProperties}>
								{t.isVideo ? (
									<video
										src={t.previewUrl}
										muted
										playsInline
										preload="metadata"
										style={{ ...PREVIEW, opacity: t.status === "busy" ? 0.35 : 1 }}
										onLoadedMetadata={(e) => onDuration(t.id, e.currentTarget.duration)}
									/>
								) : (
									// eslint-disable-next-line @next/next/no-img-element -- a local object URL of the picked file
									<img src={t.previewUrl} alt="" style={{ ...PREVIEW, opacity: t.status === "busy" ? 0.35 : 1 }} />
								)}
								{t.isVideo && (
									<span className="vt">
										<Icon name="play" />{" "}
										{t.durationSec ? `${toPersianDigits(Math.floor(t.durationSec / 60))}:${pad2(Math.round(t.durationSec % 60))}` : "ویدیو"}
									</span>
								)}
								{t.status === "busy" && (
									<>
										<span className="pc-t">{toPersianDigits(t.progress)}٪</span>
										<span className="bar">
											<i />
										</span>
									</>
								)}
								<button type="button" className="x" aria-label="حذف" onClick={() => onRemove(t.id)}>
									<Icon name="close" />
								</button>
							</div>
						),
					)}
					{tiles.length < MAX_UPLOADS && (
						<button type="button" className="up add" onClick={() => input.current?.click()}>
							<Icon name="upload" />
							افزودن
							<small>
								{toPersianDigits(tiles.length)} از {toPersianDigits(MAX_UPLOADS)}
							</small>
						</button>
					)}
				</div>
				<input
					ref={input}
					type="file"
					accept={ACCEPT}
					multiple
					hidden
					onChange={(e) => {
						onAdd(Array.from(e.target.files ?? []));
						// the same file can be picked again after removing it
						e.target.value = "";
					}}
				/>
				<div className="up-hint">
					<Icon name="info" />
					<span>عکس تا ۸ مگابایت (jpg، png، webp) و ویدیو تا ۵۰ مگابایت (mp4).</span>
				</div>
			</div>
		</div>
	);
}
