"use client";

import { useState } from "react";
import classNames from "classnames";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ProductEndpoints } from "@/app/product/_api/productEndpoints";
import ErrorComponent from "@/app/_components/common/errorComponent2/errorComponent2";
import Loading from "@/app/_components/common/loading/loading";
import { Icon } from "@/app/_components/icon/icons";
import { MessengerIcon } from "@/app/_components/icon/messengerIcon";
import MediaImage from "@/app/_components/shop/mediaImage/mediaImage";
import Modal from "@/app/_components/ui/modal/modal";
import { toast } from "@/store/notification.store";
import { ColorKey, ProductColorOption, ProductSummary } from "@/types/catalog.type";
import { MediaChangeType, OrderItem, OrderSummary } from "@/types/order.type";
import { toErrorView } from "@/utils/apiError";
import { toPersianDigits } from "@/utils/digits";
import { formatPrice } from "@/utils/format";
import { withMappedError } from "@/utils/withMappedError";
import { AccountEndpoints } from "../../_api/accountEndpoints";
import { ERROR_BEHAVIOUR, isTooLateError } from "../../_utils/apiError";
import ModalHead from "../modalHead/modalHead";

type ChangeRequestModalProps = {
	order: OrderSummary;
	open: boolean;
	onClose: () => void;
};

const TYPES: { key: MediaChangeType; icon: string; title: string; hint: string }[] = [
	{ key: "COLOR", icon: "palette", title: "رنگ دیگه", hint: "همین مدل، رنگ دیگه" },
	{ key: "MODEL", icon: "bag", title: "مدل دیگه", hint: "یه کیف دیگه به‌جاش" },
	{ key: "CANCEL_ITEM", icon: "trash", title: "حذفش کن", hint: "بقیه‌ی سفارش ارسال بشه" },
	{ key: "OTHER", icon: "chat", title: "چیز دیگه", hint: "توضیح بده چی می‌خوای" },
];

const NOTE_MAX = 500;
/** Same key and size as the product page's «محصولات مرتبط», so the two share the request. */
const RELATED_LIMIT = 8;
const MODELS = 4;

/**
 * Change request after the pre-shipment photos — colour, model, drop one bag, or anything else
 * (`POST /me/orders/{code}/media-feedback` with `REQUEST_CHANGE`) — design `order-photo-review.html`.
 */
export default function ChangeRequestModal({ order, open, onClose }: ChangeRequestModalProps) {
	const queryClient = useQueryClient();
	const [itemPick, setItemPick] = useState<number | null>(null);
	const [kind, setKind] = useState<MediaChangeType | null>(null);
	const [colorVariant, setColorVariant] = useState<number | null>(null);
	const [modelId, setModelId] = useState<number | null>(null);
	const [modelVariant, setModelVariant] = useState<number | null>(null);
	const [note, setNote] = useState("");
	const [noteError, setNoteError] = useState(false);
	const [formError, setFormError] = useState<{ text: string; n: number } | null>(null);
	const [result, setResult] = useState<{ view: "done"; step3: string } | { view: "late" } | null>(null);

	const detail = useQuery({
		queryKey: ["me", "orders", "detail", order.code],
		queryFn: () => withMappedError(() => AccountEndpoints.getOrder(order.code)),
		enabled: open,
		meta: { showNotificationOnRefetch: true },
	});

	const items = detail.data?.items ?? [];
	const multi = items.length > 1;
	const item = items.find((i) => i.id === itemPick) ?? (multi ? undefined : items[0]);

	// colours of the same bag, with their stock
	const product = useQuery({
		queryKey: ["product", "detail", String(item?.productId)],
		queryFn: () => withMappedError(() => ProductEndpoints.getProduct(String(item?.productId))),
		enabled: open && kind === "COLOR" && !!item,
		meta: { showNotificationOnRefetch: true },
	});

	// «مدل‌های مشابه و موجود»
	const related = useQuery({
		queryKey: ["product", item?.productId, "related"],
		queryFn: () => withMappedError(() => ProductEndpoints.getRelated(item?.productId ?? 0, RELATED_LIMIT)),
		enabled: open && kind === "MODEL" && !!item,
		meta: { showNotificationOnRefetch: true },
	});
	const models = (related.data ?? []).filter((p) => p.id !== item?.productId && p.stock.status !== "OUT_OF_STOCK").slice(0, MODELS);
	const model = models.find((p) => p.id === modelId);

	/** Price difference of the swap (`unit price × qty − what was paid for the line`). */
	const priceDiff = (() => {
		if (!item) return 0;
		if (kind === "COLOR" && colorVariant) {
			const variant = product.data?.variants.find((v) => v.id === colorVariant);
			return (variant?.price.price ?? item.unitPrice) * item.quantity - item.lineTotal;
		}
		if (kind === "MODEL" && model && modelVariant) return model.price.price * item.quantity - item.lineTotal;
		return 0;
	})();

	const send = useMutation({
		mutationFn: () =>
			withMappedError(() =>
				AccountEndpoints.sendMediaFeedback(order.code, {
					decision: "REQUEST_CHANGE",
					changeType: kind,
					orderItemId: item?.id ?? null,
					desiredVariantId: kind === "COLOR" ? colorVariant : kind === "MODEL" ? modelVariant : null,
					note: note.trim() || null,
				}),
			),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["me", "orders"] });
			queryClient.invalidateQueries({ queryKey: ["me", "dashboard"] });
			const step3 =
				kind === "CANCEL_ITEM" && item
					? `بعد از تأیید اپراتور، ${formatPrice(item.lineTotal)} تومان به کارتت برمی‌گرده.`
					: priceDiff > 0
						? `مابه‌التفاوت ${formatPrice(priceDiff)} تومانی رو با لینکی که برات می‌فرستیم پرداخت می‌کنی.`
						: priceDiff < 0
							? `مابه‌التفاوت ${formatPrice(-priceDiff)} تومانی به کارتت برمی‌گرده.`
							: "اگه قیمت فرق داشت، لینک پرداخت یا برگشت وجهش برات فرستاده می‌شه.";
			setResult({ view: "done", step3 });
		},
		onError: (e) => {
			// shipped meanwhile
			if (isTooLateError(e)) {
				queryClient.invalidateQueries({ queryKey: ["me", "orders"] });
				return setResult({ view: "late" });
			}
			toast(e.description, { type: "error" });
		},
	});

	const fail = (text: string) => setFormError((f) => ({ text, n: (f?.n ?? 0) + 1 }));

	const submit = () => {
		if (!item) return fail("اول کیفی که می‌خوای عوض بشه رو انتخاب کن.");
		if (!kind) return fail("بگو چی رو عوض کنیم: رنگ، مدل یا چیز دیگه.");
		if (kind === "COLOR" && !colorVariant) return fail("رنگ جدید رو انتخاب کن.");
		if (kind === "MODEL" && !(model && modelVariant)) return fail(model ? "رنگ مدل جدید رو انتخاب کن." : "مدل جدید رو انتخاب کن.");
		if (kind === "OTHER" && note.trim().length < 5) {
			setNoteError(true);
			return document.getElementById(`chNote-${order.code}`)?.focus();
		}
		send.mutate();
	};

	const changed = () => setFormError(null);
	const types = TYPES.filter((t) => t.key !== "CANCEL_ITEM" || multi);
	const channel = order.preShipmentMedia?.channel;
	const channelName = order.preShipmentMedia?.channelName ?? "";
	const detailError = toErrorView(ERROR_BEHAVIOUR, detail.error, "دریافت جزئیات سفارش با خطا مواجه شد.");
	const productError = toErrorView(ERROR_BEHAVIOUR, product.error, "دریافت رنگ‌های این کیف با خطا مواجه شد.");
	const relatedError = toErrorView(ERROR_BEHAVIOUR, related.error, "دریافت مدل‌های مشابه با خطا مواجه شد.");

	return (
		<Modal open={open} onClose={onClose} width={660}>
			<div className={classNames("mv", { in: !!result })} key={result?.view ?? "form"}>
				{result?.view === "done" ? (
					<div className="m-done">
						<div className="ck purple">
							<Icon name="send" />
						</div>
						<h3>درخواستت ثبت شد</h3>
						<p>تا وقتی هماهنگ نشده، سفارشت ارسال نمی‌شه.</p>
						<div className="next">
							<div>
								<span className="nn">۱</span>
								<span>
									اپراتور توی <b>{channelName}</b> باهات هماهنگ می‌کنه — معمولاً کمتر از یک ساعت.
								</span>
							</div>
							<div>
								<span className="nn">۲</span>
								<span>قبل از ارسال، از کیف جدید عکس و ویدیو می‌گیریم تا دوباره تأییدش کنی.</span>
							</div>
							<div>
								<span className="nn">۳</span>
								<span>{result.step3}</span>
							</div>
						</div>
						<div className="acts">
							<button type="button" className="btn btn-primary btn-block" onClick={onClose}>
								باشه
							</button>
						</div>
					</div>
				) : result?.view === "late" ? (
					<div className="m-done">
						<div className="ck danger">
							<Icon name="truck" />
						</div>
						<h3>دیگه نمی‌شه تغییرش داد</h3>
						<p>
							سفارش {order.code} همین الان تحویل {order.shippingMethod.name} شد. بعد از تحویل، اگه کیف رو نخواستی، تا ۷ روز می‌تونی درخواست مرجوعی بدی.
						</p>
						<div className="acts">
							<button type="button" className="btn btn-primary btn-block" onClick={onClose}>
								باشه
							</button>
						</div>
					</div>
				) : (
					<>
						<ModalHead icon="swap" title="درخواست تغییر" sub={`${order.code} · هر تغییری بخوای، قبل از ارسال انجامش می‌دیم`} />
						{detail.isLoading ? (
							<Loading />
						) : !!detailError ? (
							<ErrorComponent
								retryable={detailError.retryable}
								ticketAble={detailError.ticketAble}
								errorText={detailError.errorText}
								executeFunction={() => detail.refetch()}
								variant="text"
								height={56}
								loading={detail.isFetching}
							/>
						) : !detail.error && !!detail.data ? (
							<>
								{multi && (
									<div className="m-sec">
										<div className="m-lb">کدوم کیف؟</div>
										<div className="ci-list">
											{items.map((i) => (
												<label key={i.id} className="opt-card">
													<input
														type="radio"
														name={`ci-${order.code}`}
														checked={item?.id === i.id}
														onChange={() => {
															setItemPick(i.id);
															setColorVariant(null);
															setModelId(null);
															setModelVariant(null);
															changed();
														}}
													/>
													<span className="radio" />
													<span className="th">
														<MediaImage src={i.image?.url} alt={i.name} />
													</span>
													<span>
														<span className="t" style={{ display: "block" }}>
															{i.name}
														</span>
														<span className="d" style={{ display: "flex", alignItems: "center", gap: 5 }}>
															<span className="swatch-dot" style={{ background: i.color.hex }} /> {i.color.name} · {formatPrice(i.lineTotal)} تومان
														</span>
													</span>
												</label>
											))}
										</div>
									</div>
								)}
								<div className="m-sec">
									<div className="m-lb">چی رو عوض کنیم؟</div>
									<div className="ct-grid" style={{ gridTemplateColumns: `repeat(${types.length},1fr)` }}>
										{types.map((t) => (
											<label key={t.key} className="opt-card">
												<input
													type="radio"
													name={`ct-${order.code}`}
													checked={kind === t.key}
													onChange={() => {
														setKind(t.key);
														setNoteError(false);
														changed();
													}}
												/>
												<span className="radio" />
												<span className="ic">
													<Icon name={t.icon} />
												</span>
												<span className="t">{t.title}</span>
												<span className="d">{t.hint}</span>
											</label>
										))}
									</div>
								</div>
								{!!kind && !item ? (
									<div className="m-sec">
										<div className="note">
											<Icon name="info" />
											<span>اول بگو کدوم کیف رو می‌خوای عوض کنیم.</span>
										</div>
									</div>
								) : kind === "COLOR" && item ? (
									<div className="m-sec">
										<div className="m-lb">
											رنگ جدید <small>{item.name}</small>
										</div>
										{product.isLoading ? (
											<Loading />
										) : !!productError ? (
											<ErrorComponent
												retryable={productError.retryable}
												ticketAble={productError.ticketAble}
												errorText={productError.errorText}
												executeFunction={() => product.refetch()}
												variant="text"
												height={56}
												loading={product.isFetching}
											/>
										) : !product.error && !!product.data ? (
											<>
												<Swatches
													options={product.data.colors}
													currentKey={item.color.key}
													name={`nc-${order.code}`}
													selected={colorVariant}
													onPick={(id) => {
														setColorVariant(id);
														changed();
													}}
												/>
												{(() => {
													const pick = product.data.colors.find((c) => c.variantId === colorVariant);
													return pick ? (
														<>
															<Compare item={item} next={pick} />
															<PriceDiff diff={priceDiff} />
														</>
													) : null;
												})()}
											</>
										) : null}
									</div>
								) : kind === "MODEL" && item ? (
									<div className="m-sec">
										<div className="m-lb">
											مدل جدید <small>مدل‌های مشابه و موجود</small>
										</div>
										{related.isLoading ? (
											<Loading />
										) : !!relatedError ? (
											<ErrorComponent
												retryable={relatedError.retryable}
												ticketAble={relatedError.ticketAble}
												errorText={relatedError.errorText}
												executeFunction={() => related.refetch()}
												variant="text"
												height={56}
												loading={related.isFetching}
											/>
										) : (
											<>
												<div className="mdl-list">
													{models.map((p) => (
														<ModelCard
															key={p.id}
															product={p}
															on={modelId === p.id}
															onPick={() => {
																setModelId(p.id);
																setModelVariant(null);
																changed();
															}}
														/>
													))}
												</div>
												<p className="muted" style={{ fontSize: 12, marginTop: 8 }}>
													مدل دیگه‌ای مدنظرته؟ اسمش رو توی توضیحات بنویس.
												</p>
												{model && (
													<>
														<div className="m-lb" style={{ marginTop: 16 }}>
															رنگ {model.name}
														</div>
														<Swatches
															options={model.colors}
															name={`mc-${order.code}`}
															selected={modelVariant}
															onPick={(id) => {
																setModelVariant(id);
																changed();
															}}
														/>
														{(() => {
															const pick = model.colors.find((c) => c.variantId === modelVariant);
															return pick ? (
																<>
																	<Compare item={item} next={pick} nextName={model.name} />
																	<PriceDiff diff={priceDiff} />
																</>
															) : null;
														})()}
													</>
												)}
											</>
										)}
									</div>
								) : kind === "CANCEL_ITEM" && item ? (
									<div className="m-sec">
										<div className="rf" style={{ marginTop: 0 }}>
											<Icon name="card" />
											<span>
												<b>{formatPrice(item.lineTotal)} تومان برمی‌گرده</b>
												<small>{item.name} از سفارش حذف می‌شه و مبلغش به کارتت برمی‌گرده؛ بقیه‌ی سفارش طبق برنامه ارسال می‌شه.</small>
											</span>
										</div>
									</div>
								) : null}
							</>
						) : null}
						<div className={classNames("m-sec field", { error: noteError })}>
							<label htmlFor={`chNote-${order.code}`}>
								توضیح برای اپراتور <span className="opt">{kind === "OTHER" ? "(لازم)" : "(اختیاری)"}</span>
							</label>
							<textarea
								className="textarea"
								id={`chNote-${order.code}`}
								maxLength={NOTE_MAX}
								style={{ minHeight: 80 }}
								placeholder="مثلاً: اگه مشکی تموم شده، سرمه‌ای هم خوبه"
								value={note}
								onChange={(e) => {
									setNote(e.target.value);
									setNoteError(false);
								}}
							/>
							<div className={classNames("tcount", { over: note.length > NOTE_MAX })}>
								<span className="err">بنویس چه تغییری می‌خوای</span>
								<span>
									{toPersianDigits(note.length)}/{toPersianDigits(NOTE_MAX)}
								</span>
							</div>
						</div>
						<div className="note" style={{ marginTop: 14 }}>
							{channel && <MessengerIcon channel={channel} width={18} height={18} />}
							<span>اپراتور توی {channelName} باهات هماهنگ می‌کنه و قبل از ارسال، از کیف جدید هم عکس می‌گیره تا دوباره ببینیش.</span>
						</div>
						<div key={formError?.n ?? 0} className={classNames("note danger m-err", { on: !!formError, shake: !!formError })}>
							<Icon name="alert" />
							<span>{formError?.text}</span>
						</div>
						<div className="m-foot">
							<button type="button" className="btn btn-outline" onClick={onClose}>
								انصراف
							</button>
							<button type="button" className={classNames("btn btn-primary", { loading: send.isPending })} onClick={submit}>
								<Icon name="send" /> ثبت درخواست تغییر
							</button>
						</div>
					</>
				)}
			</div>
		</Modal>
	);
}

type SwatchesProps = {
	options: ProductColorOption[];
	/** The colour the shopper already has (dashed, not selectable). */
	currentKey?: ColorKey;
	name: string;
	selected: number | null;
	onPick: (variantId: number) => void;
};

/** `.sw-grid` of `.swc` — sold-out colours struck through and disabled. */
function Swatches({ options, currentKey, name, selected, onPick }: SwatchesProps) {
	return (
		<div className="sw-grid">
			{options.map((o) => {
				const current = o.color.key === currentKey;
				const soldOut = o.stockStatus === "OUT_OF_STOCK";
				return (
					<label key={o.variantId} className={classNames("swc", { cur: current, so: soldOut })}>
						<input type="radio" name={name} checked={selected === o.variantId} disabled={current || soldOut} onChange={() => onPick(o.variantId)} />
						<span className="bx">
							<span className="dot" style={{ background: o.color.hex, color: o.color.isLight ? "#2A1F3D" : "#fff" }}>
								<Icon name="check" />
							</span>
							<span>
								<b>{o.color.name}</b>
								<small>{current ? "رنگ فعلی" : soldOut ? "تمام شد" : "موجود"}</small>
							</span>
						</span>
					</label>
				);
			})}
		</div>
	);
}

/** `.cmp` — what the shopper has now → after the change. */
function Compare({ item, next, nextName }: { item: OrderItem; next: ProductColorOption; nextName?: string }) {
	return (
		<div className="cmp">
			<div className="side-c">
				<div className="art">
					<MediaImage src={item.image?.url} alt={item.name} />
				</div>
				<span>
					<small>الان</small>
					<b>
						{nextName ? `${item.name} ` : ""}
						{item.color.name}
					</b>
				</span>
			</div>
			<span className="ar">
				<Icon name="arrow" />
			</span>
			<div className="side-c new">
				{/* keyed so the design's swap-in plays on every pick */}
				<div className="art" key={next.variantId}>
					<MediaImage src={next.thumbnailUrl ?? next.imageUrl} alt={next.color.name} />
				</div>
				<span>
					<small>بعد از تغییر</small>
					<b>
						{nextName ? `${nextName} ` : ""}
						{next.color.name}
					</b>
				</span>
			</div>
		</div>
	);
}

/** `.diff` — same price, the shopper pays the difference, or gets it back. */
function PriceDiff({ diff }: { diff: number }) {
	if (diff === 0)
		return (
			<div className="diff">
				<Icon name="check" />
				<span>قیمت فرقی نمی‌کنه.</span>
			</div>
		);
	if (diff > 0)
		return (
			<div className="diff d-up">
				<Icon name="info" />
				<span>
					<b>{formatPrice(diff)} تومان</b> بیشتر؛ بعد از هماهنگی، لینک پرداخت مابه‌التفاوت برات فرستاده می‌شه.
				</span>
			</div>
		);
	return (
		<div className="diff d-down">
			<Icon name="card" />
			<span>
				<b>{formatPrice(-diff)} تومان</b> کمتر؛ مابه‌التفاوت به کارتت برمی‌گرده.
			</span>
		</div>
	);
}

/** `.mdl` — a similar bag in stock, with its price and first colours. */
function ModelCard({ product, on, onPick }: { product: ProductSummary; on: boolean; onPick: () => void }) {
	return (
		<button type="button" className={classNames("mdl", { on })} onClick={onPick}>
			<span className="th">
				<MediaImage src={product.image?.url} alt={product.name} />
			</span>
			<span>
				<b>{product.name}</b>
				<small>{formatPrice(product.price.price)} تومان</small>
				<span className="cds">
					{product.colors.slice(0, 5).map((c) => (
						<i key={c.variantId} style={{ background: c.color.hex }} />
					))}
				</span>
			</span>
		</button>
	);
}
