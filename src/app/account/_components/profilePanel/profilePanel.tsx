"use client";

import { useMemo, useState } from "react";
import classNames from "classnames";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import ErrorComponent from "@/app/_components/common/errorComponent2/errorComponent2";
import Loading from "@/app/_components/common/loading/loading";
import { MessengerIcon } from "@/app/_components/icon/messengerIcon";
import Input from "@/app/_components/ui/input/input";
import Select from "@/app/_components/ui/select/select";
import Switch from "@/app/_components/ui/switch/switch";
import { useForm, ValidationSchema } from "@/hooks/useForm";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "@/store/notification.store";
import { PhotoMessengerChannel } from "@/types/order.type";
import { Gender, User } from "@/types/user.type";
import { toErrorView } from "@/utils/apiError";
import { convertPersianToEnglishString, toPersianDigits } from "@/utils/digits";
import { gregorianToJalali, jalaliToGregorian } from "@/utils/jalali";
import { withMappedError } from "@/utils/withMappedError";
import { AccountEndpoints } from "../../_api/accountEndpoints";
import { ERROR_BEHAVIOUR, isChangedBySomeoneElseError } from "../../_utils/apiError";
import PhoneChangeModal from "../phoneChangeModal/phoneChangeModal";

const MESSENGERS: { channel: PhotoMessengerChannel; name: string }[] = [
	{ channel: "RUBIKA", name: "روبیکا" },
	{ channel: "TELEGRAM", name: "تلگرام" },
	{ channel: "BALE", name: "بله" },
];

const GENDERS = [
	{ value: "FEMALE", label: "خانم" },
	{ value: "MALE", label: "آقا" },
];

type ProfileValues = {
	firstName: string;
	lastName: string;
	email: string;
	/** Jalali, as typed (`۱۳۷۵/۰۶/۲۰`). */
	birthDate: string;
	gender: "" | Exclude<Gender, "UNSPECIFIED">;
	messenger: "" | PhotoMessengerChannel;
	sms: boolean;
};

const SCHEMA: ValidationSchema<ProfileValues> = {
	email: (v) => (v.trim() && !/^\S+@\S+\.\S+$/.test(v.trim()) ? "ایمیل معتبر نیست" : undefined),
	birthDate: (v) => (v.trim() && !jalaliToGregorian(v) ? "تاریخ رو به شکل ۱۳۷۵/۰۶/۲۰ بنویس" : undefined),
};

/** `#p-profile` «اطلاعات شخصی» — the form starts from a fresh `GET /me`. «تغییر» next to the number opens the phone change. */
export default function ProfilePanel() {
	const me = useQuery({
		queryKey: ["me", "profile"],
		queryFn: () => withMappedError(() => AccountEndpoints.getMe()),
		meta: { showNotificationOnRefetch: true },
	});
	// bumped to start the form over from a fresh profile (someone else saved meanwhile)
	const [formVersion, setFormVersion] = useState(0);
	// a fresh modal on every open
	const [phoneChange, setPhoneChange] = useState({ open: false, key: 0 });

	const meError = toErrorView(ERROR_BEHAVIOUR, me.error, "دریافت اطلاعات شخصی با خطا مواجه شد.");

	return (
		<div className="panel on" id="p-profile">
			<div className="p-head">
				<h2>اطلاعات شخصی</h2>
			</div>
			{me.isLoading ? (
				<Loading />
			) : !!meError ? (
				<ErrorComponent
					retryable={meError.retryable}
					ticketAble={meError.ticketAble}
					errorText={meError.errorText}
					executeFunction={() => me.refetch()}
					loading={me.isFetching}
				/>
			) : !me.error && !!me.data ? (
				<ProfileForm
					key={`${me.data.id}:${formVersion}`}
					user={me.data}
					onChangePhone={() => setPhoneChange((m) => ({ open: true, key: m.key + 1 }))}
					onStale={() => me.refetch().then(() => setFormVersion((v) => v + 1))}
				/>
			) : null}
			{!!me.data && (
				<PhoneChangeModal
					key={phoneChange.key}
					open={phoneChange.open}
					onClose={() => setPhoneChange((m) => ({ ...m, open: false }))}
					currentPhone={me.data.phone}
				/>
			)}
		</div>
	);
}

type ProfileFormProps = {
	user: User;
	onChangePhone: () => void;
	/** The profile changed elsewhere since it was read — re-read it and start the form over. */
	onStale: () => void;
};

function ProfileForm({ user, onChangePhone, onStale }: ProfileFormProps) {
	const queryClient = useQueryClient();
	const setUser = useAuthStore((s) => s.setUser);

	const initialValues = useMemo<ProfileValues>(
		() => ({
			firstName: user.firstName ?? "",
			lastName: user.lastName ?? "",
			email: user.email ?? "",
			birthDate: toPersianDigits(gregorianToJalali(user.birthDate)),
			gender: user.gender === "FEMALE" || user.gender === "MALE" ? user.gender : "",
			messenger: user.defaultMessenger ?? "",
			sms: user.marketingSmsOptIn !== false,
		}),
		[user],
	);

	const save = useMutation({
		mutationFn: (v: ProfileValues) =>
			withMappedError(() =>
				AccountEndpoints.updateMe({
					firstName: v.firstName.trim() || null,
					lastName: v.lastName.trim() || null,
					email: v.email.trim() || null,
					birthDate: v.birthDate.trim() ? jalaliToGregorian(v.birthDate) : null,
					gender: v.gender || "UNSPECIFIED",
					defaultMessenger: v.messenger || null,
					marketingSmsOptIn: v.sms,
				}),
			),
		onSuccess: (saved) => {
			setUser(saved);
			queryClient.invalidateQueries({ queryKey: ["me", "dashboard"] });
			toast("اطلاعاتت ذخیره شد", { icon: "check" });
		},
		onError: (e) => {
			// saved elsewhere meanwhile (another tab / device) and nothing was stored — read it again (FRONTEND_AUTH §8)
			if (isChangedBySomeoneElseError(e)) {
				toast(e.description, { type: "info", duration: 4500 });
				return onStale();
			}
			toast(e.description, { type: "error" });
		},
	});

	const form = useForm<ProfileValues>({ initialValues, validationSchema: SCHEMA, onSubmit: (values) => save.mutate(values) });

	return (
		<form className="card" id="pf" noValidate style={{ padding: 26 }} onSubmit={form.handleSubmit}>
			<div className="form-grid">
				<Input id="fn" label="نام" maxLength={50} {...form.getFieldProps("firstName")} />
				<Input id="ln" label="نام خانوادگی" maxLength={50} {...form.getFieldProps("lastName")} />
				<div className="field">
					<label>شماره موبایل</label>
					<div className="input-group">
						<input className="input ltr" value={toPersianDigits(user.phone)} disabled style={{ background: "var(--lilac-50)" }} aria-label="شماره موبایل" />
						<button type="button" className="btn btn-soft" id="chPh" onClick={onChangePhone}>
							تغییر
						</button>
					</div>
					<span className="help">ورود با همین شماره و کد یک‌بارمصرف انجام می‌شه.</span>
				</div>
				<Input
					id="em"
					wrapperId="emF"
					type="email"
					label="ایمیل"
					labelNote="اختیاری"
					direction="ltr"
					placeholder="name@example.com"
					{...form.getFieldProps("email")}
				/>
				<Input
					id="bd"
					label="تاریخ تولد"
					labelNote="برای هدیه تولد"
					direction="ltr"
					placeholder="۱۳۷۵/۰۶/۲۰"
					inputMode="numeric"
					maxLength={10}
					{...form.getFieldProps("birthDate")}
					onChange={(e) => form.setFieldValue("birthDate", toPersianDigits(convertPersianToEnglishString(e.target.value)))}
				/>
				<Select
					id="gd"
					label="جنسیت"
					labelNote="اختیاری"
					placeholder="ترجیح می‌دم نگم"
					options={GENDERS}
					value={form.values.gender}
					onChange={(e) => form.setFieldValue("gender", e.target.value as ProfileValues["gender"])}
				/>
				<div className="field full">
					<label>پیام‌رسان پیش‌فرض برای دریافت عکس کیف</label>
					<div className="msg-chips">
						{MESSENGERS.map((m) => (
							<label key={m.channel} className="msg-chip">
								<input type="radio" name="dm" value={m.channel} checked={form.values.messenger === m.channel} onChange={() => form.setFieldValue("messenger", m.channel)} />
								<span>
									<MessengerIcon channel={m.channel} />
									{m.name}
								</span>
							</label>
						))}
					</div>
				</div>
				<div className="field full">
					<Switch
						id="nl"
						labelStyle={{ justifyContent: "flex-start", gap: 14 }}
						labelAfter="دریافت پیامک تخفیف‌ها و کالکشن‌های جدید"
						checked={form.values.sms}
						onChange={(e) => form.setFieldValue("sms", e.target.checked)}
					/>
				</div>
			</div>
			<button type="submit" className={classNames("btn btn-primary", { loading: save.isPending })} style={{ marginTop: 22 }}>
				ذخیره تغییرات
			</button>
		</form>
	);
}
