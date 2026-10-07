"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import ErrorComponent from "@/app/_components/common/errorComponent2/errorComponent2";
import Loading from "@/app/_components/common/loading/loading";
import { useRequireLogin } from "@/hooks/useRequireLogin";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "@/store/notification.store";
import { CreateReturnPayload, OrderCode, OrderDetail, RefundMethod, ReturnReason, ReturnRequest } from "@/types/order.type";
import { toErrorView } from "@/utils/apiError";
import { toPersianDigits } from "@/utils/digits";
import { generateID } from "@/utils/generateId";
import { withMappedError } from "@/utils/withMappedError";
import { AccountEndpoints } from "../../_api/accountEndpoints";
import { ERROR_BEHAVIOUR, isNotReturnableError } from "../../_utils/apiError";
import { dayLong, RETURN_REASONS } from "../../_utils/orderActions";
import { isVideoFile, MAX_UPLOADS, returnableQuantity, returnDeadline, sizeError, UPLOAD_TYPE_ERROR, UploadTile, uploadProblem } from "../../_utils/returnForm";
import ReturnDone from "../returnDone/returnDone";
import ReturnGate from "../returnGate/returnGate";
import ReturnHero from "../returnHero/returnHero";
import ReturnItemsBlock from "../returnItemsBlock/returnItemsBlock";
import ReturnProofBlock from "../returnProofBlock/returnProofBlock";
import ReturnReasonBlock from "../returnReasonBlock/returnReasonBlock";
import ReturnRefundBlock from "../returnRefundBlock/returnRefundBlock";
import ReturnSummary from "../returnSummary/returnSummary";

const DESC_MIN = 10;

/** The design's `A.shake` on a block that needs attention. */
const shake = (el: HTMLElement) =>
	el.animate(
		[
			{ transform: "translateX(0)" },
			{ transform: "translateX(-6px)" },
			{ transform: "translateX(6px)" },
			{ transform: "translateX(-3px)" },
			{ transform: "none" },
		],
		{
			duration: 400,
		},
	);

/** Why the page is closed, from the order itself (when it loads) — the server's answer wins after a submit. */
function closedText(order: OrderDetail, deadline: number | null, now: number) {
	const deliveredAt = order.shipment?.deliveredAt;
	if (order.status === "DELIVERED" && deadline && deadline <= now)
		return {
			expired: true,
			text: `${deliveredAt ? `کیف‌های این سفارش ${dayLong(deliveredAt)} تحویل شدن و ` : ""}مهلت ۷ روزه‌ی بازگشت ${dayLong(deadline)} تموم شد. اگه کیفت ایراد داره، با پشتیبانی در تماس باش تا بررسی‌اش کنیم.`,
		};
	if (order.returns?.length) return { expired: false, text: "برای همه‌ی کیف‌های این سفارش قبلاً درخواست مرجوعی ثبت شده. وضعیتش رو توی «سفارش‌های من» ببین." };
	if (!["DELIVERED", "RETURN_REQUESTED", "RETURNED", "REFUNDED"].includes(order.status))
		return { expired: false, text: "این سفارش هنوز تحویل نشده؛ بعد از تحویل تا ۷ روز می‌تونی درخواست مرجوعی بدی." };
	return { expired: false, text: "مرجوعی برای این سفارش فعال نیست؛ وضعیتش رو توی «سفارش‌های من» ببین." };
}

/**
 * `/account/orders/{code}/return` — design `order-return.html`: pick the bags and quantities, the reason,
 * photos / video (uploaded as soon as they're picked) and where the money goes (`POST /me/orders/{code}/returns`).
 */
export default function ReturnView({ code }: { code: OrderCode }) {
	const queryClient = useQueryClient();
	const hydrated = useAuthStore((s) => s.hydrated);
	const signedIn = useAuthStore((s) => !!s.accessToken);
	useRequireLogin();

	const [selected, setSelected] = useState<Record<number, boolean>>({});
	const [quantities, setQuantities] = useState<Record<number, number>>({});
	const [reason, setReason] = useState<ReturnReason | null>(null);
	const [description, setDescription] = useState("");
	const [descriptionError, setDescriptionError] = useState<string | null>(null);
	const [tiles, setTiles] = useState<UploadTile[]>([]);
	const [method, setMethod] = useState<RefundMethod>("ORIGINAL_PAYMENT");
	const [iban, setIban] = useState("");
	const [ibanError, setIbanError] = useState<string | null>(null);
	const [blockErrors, setBlockErrors] = useState({ items: false, reason: false });
	/** Set when the server says the window closed / the order isn't returnable. */
	const [closed, setClosed] = useState<{ expired: boolean; text: string } | null>(null);
	const [done, setDone] = useState<{ ret: ReturnRequest; amount: number } | null>(null);
	const [now] = useState(() => Date.now());
	const itemsRef = useRef<HTMLDivElement>(null);
	const reasonRef = useRef<HTMLDivElement>(null);
	const proofRef = useRef<HTMLDivElement>(null);
	const refundRef = useRef<HTMLDivElement>(null);
	const tilesRef = useRef(tiles);

	// leaving the page stops the uploads and frees the previews
	useEffect(() => {
		tilesRef.current = tiles;
	}, [tiles]);
	useEffect(
		() => () =>
			tilesRef.current.forEach((t) => {
				t.controller?.abort();
				if (t.previewUrl) URL.revokeObjectURL(t.previewUrl);
			}),
		[],
	);

	const detail = useQuery({
		queryKey: ["me", "orders", "detail", code],
		queryFn: () => withMappedError(() => AccountEndpoints.getOrder(code)),
		enabled: hydrated && signedIn,
		meta: { showNotificationOnRefetch: true },
	});

	const patchTile = (id: string, patch: Partial<UploadTile>) => setTiles((list) => list.map((t) => (t.id === id ? { ...t, ...patch } : t)));

	// one call per tile, running side by side; the tile carries its own state
	const upload = useMutation({
		mutationFn: (tile: UploadTile) =>
			withMappedError(() => AccountEndpoints.uploadFile(tile.file, "RETURN_EVIDENCE", (progress) => patchTile(tile.id, { progress }), tile.controller?.signal)),
		onSuccess: (asset, tile) => patchTile(tile.id, { status: "ok", progress: 100, asset }),
		onError: (e, tile) =>
			patchTile(tile.id, {
				status: "err",
				error: e.code === "UPLOAD_TOO_LARGE" ? sizeError(tile.isVideo) : e.code === "UPLOAD_TYPE_NOT_ALLOWED" ? UPLOAD_TYPE_ERROR : "آپلود نشد",
			}),
	});

	const create = useMutation({
		mutationFn: (payload: CreateReturnPayload) => withMappedError(() => AccountEndpoints.createReturn(code, payload)),
		onSuccess: (ret, payload) => {
			queryClient.invalidateQueries({ queryKey: ["me", "orders"] });
			queryClient.invalidateQueries({ queryKey: ["me", "returns"] });
			queryClient.invalidateQueries({ queryKey: ["me", "dashboard"] });
			const items = detail.data?.items ?? [];
			const amount = payload.items.reduce((s, p) => s + (items.find((i) => i.id === p.orderItemId)?.unitPrice ?? 0) * p.quantity, 0);
			setDone({ ret, amount });
			window.scrollTo(0, 0);
		},
		onError: (e) => {
			// the window closed / everything is already requested — the page closes with the server's reason
			if (isNotReturnableError(e)) {
				queryClient.invalidateQueries({ queryKey: ["me", "orders"] });
				setClosed({ expired: e.code === "RETURN_WINDOW_EXPIRED", text: e.description });
				return window.scrollTo(0, 0);
			}
			// field answers go on the field, like the client-side checks
			const field = (name: string) => e.errorDetails?.find((d) => d.field === name || d.field?.startsWith(`${name}[`) || d.field?.startsWith(`${name}.`));
			const ibanDetail = field("iban");
			const descriptionDetail = field("description");
			const itemsDetail = field("items");
			if (ibanDetail) setIbanError(ibanDetail.message);
			if (descriptionDetail) setDescriptionError(descriptionDetail.message);
			if (itemsDetail) setBlockErrors((b) => ({ ...b, items: true }));
			const block = itemsDetail ? itemsRef.current : descriptionDetail ? proofRef.current : ibanDetail ? refundRef.current : null;
			if (block) return block.scrollIntoView({ behavior: "smooth", block: "center" });
			toast(e.description, { type: "error" });
		},
	});

	const order = detail.data;
	const lines = order ? order.items.map((item) => ({ item, returnable: returnableQuantity(order, item, now) })) : [];
	const picked = lines
		.filter((l) => l.returnable && selected[l.item.id])
		.map((l) => ({ item: l.item, quantity: l.returnable > 1 ? (quantities[l.item.id] ?? 1) : 1 }));
	const payer = RETURN_REASONS.find((r) => r.key === reason)?.payer;
	const deadline = order ? returnDeadline(order) : null;
	const deliveredAt = order?.shipment?.deliveredAt;
	// once sent, the re-read order has nothing left to return — that's the success, not a closed page
	const gate = done ? null : (closed ?? (order && !(order.actions?.canReturn && lines.some((l) => l.returnable)) ? closedText(order, deadline, now) : null));

	const addFiles = (files: File[]) => {
		const room = MAX_UPLOADS - tiles.length;
		if (files.length > room) toast(`حداکثر ${toPersianDigits(MAX_UPLOADS)} فایل می‌تونی بفرستی`, { type: "warning" });
		const fresh: UploadTile[] = files.slice(0, Math.max(0, room)).map((file) => {
			const problem = uploadProblem(file);
			return {
				id: generateID(),
				file,
				previewUrl: problem ? "" : URL.createObjectURL(file),
				isVideo: isVideoFile(file),
				status: problem ? "err" : "busy",
				progress: 0,
				error: problem ?? undefined,
				controller: problem ? undefined : new AbortController(),
			};
		});
		setTiles((list) => [...list, ...fresh]);
		fresh.filter((t) => t.status === "busy").forEach((t) => upload.mutate(t));
	};

	const removeFile = (id: string) => {
		const tile = tiles.find((t) => t.id === id);
		tile?.controller?.abort();
		if (tile?.previewUrl) URL.revokeObjectURL(tile.previewUrl);
		setTiles((list) => list.filter((t) => t.id !== id));
	};

	const submit = () => {
		const errors = { items: !picked.length, reason: !reason };
		const descriptionShort = reason === "OTHER" && description.trim().length < DESC_MIN;
		const ibanBad = method === "BANK_TRANSFER" && iban.length !== 24;
		setBlockErrors(errors);
		setDescriptionError(descriptionShort ? "توضیح بده چی شده (حداقل ۱۰ حرف)" : null);
		setIbanError(ibanBad ? "شماره شبا باید ۲۴ رقم باشه" : null);
		const first = errors.items
			? itemsRef.current
			: errors.reason
				? reasonRef.current
				: descriptionShort
					? proofRef.current
					: ibanBad
						? refundRef.current
						: null;
		if (first) {
			window.scrollTo({ top: first.getBoundingClientRect().top + window.scrollY - 120 });
			shake(first);
			return;
		}
		if (!reason) return;
		if (tiles.some((t) => t.status === "busy")) return toast("صبر کن آپلود عکس‌ها تموم بشه", { type: "info", icon: "info" });
		create.mutate({
			items: picked.map((p) => ({ orderItemId: p.item.id, quantity: p.quantity })),
			reason,
			description: description.trim() || undefined,
			mediaIds: tiles.flatMap((t) => (t.status === "ok" && t.asset ? [t.asset.id] : [])),
			refundMethod: method,
			iban: method === "BANK_TRANSFER" ? `IR${iban}` : null,
		});
	};

	const detailError = toErrorView(ERROR_BEHAVIOUR, detail.error, "دریافت اطلاعات سفارش با خطا مواجه شد.");

	return (
		<main>
			<ReturnHero>
				سفارش{" "}
				<b className="ltr" style={{ display: "inline-block" }}>
					{code}
				</b>
				{!gate && deliveredAt && deadline && ` · تحویل‌شده در ${dayLong(deliveredAt)} · مهلت مرجوعی تا ${dayLong(deadline)}`}
			</ReturnHero>
			{!hydrated || !signedIn || detail.isLoading ? (
				<div className="container">
					<Loading />
				</div>
			) : !!detailError ? (
				<div className="container" style={{ paddingTop: 36 }}>
					<ErrorComponent
						retryable={detailError.retryable}
						ticketAble={detailError.ticketAble}
						errorText={detailError.errorText}
						executeFunction={() => detail.refetch()}
						loading={detail.isFetching}
					/>
				</div>
			) : done ? (
				<ReturnDone ret={done.ret} amount={done.amount} method={method} />
			) : gate ? (
				<ReturnGate expired={gate.expired} text={gate.text} />
			) : !detail.error && !!order ? (
				<div className="container">
					<div className="rt-wrap">
						<div>
							<ReturnItemsBlock
								blockRef={itemsRef}
								lines={lines}
								selected={selected}
								quantities={quantities}
								onToggle={(id, on) => {
									setSelected((s) => ({ ...s, [id]: on }));
									setBlockErrors((b) => ({ ...b, items: false }));
								}}
								onQuantity={(id, quantity) => setQuantities((q) => ({ ...q, [id]: quantity }))}
								error={blockErrors.items}
							/>
							<ReturnReasonBlock
								blockRef={reasonRef}
								reason={reason}
								onReason={(r) => {
									setReason(r);
									setBlockErrors((b) => ({ ...b, reason: false }));
								}}
								error={blockErrors.reason}
							/>
							<ReturnProofBlock
								blockRef={proofRef}
								reason={reason}
								payer={payer}
								description={description}
								onDescription={(value) => {
									setDescription(value);
									setDescriptionError(null);
								}}
								descriptionError={descriptionError}
								tiles={tiles}
								onAdd={addFiles}
								onRemove={removeFile}
								onDuration={(id, durationSec) => patchTile(id, { durationSec })}
							/>
							<ReturnRefundBlock
								blockRef={refundRef}
								method={method}
								onMethod={setMethod}
								iban={iban}
								onIban={(digits) => {
									setIban(digits);
									setIbanError(null);
								}}
								ibanError={ibanError}
								cardMask={order.payment?.cardMask}
							/>
						</div>
						<ReturnSummary
							orderCode={order.code}
							deliveredAt={deliveredAt}
							deadline={deadline}
							picked={picked}
							payer={payer}
							method={method}
							submitting={create.isPending}
							onSubmit={submit}
						/>
					</div>
				</div>
			) : null}
		</main>
	);
}
