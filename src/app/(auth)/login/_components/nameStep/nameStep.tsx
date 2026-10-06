"use client";

import { FormEvent, useState } from "react";
import classNames from "classnames";
import { useMutation } from "@tanstack/react-query";
import { AccountEndpoints } from "@/app/account/_api/accountEndpoints";
import Input from "@/app/_components/ui/input/input";
import { useAuthStore } from "@/store/auth.store";
import { withMappedError } from "@/utils/withMappedError";

/** Step ۳ (new shoppers only, optional) «دوست داری چی صدات کنیم؟». */
export default function NameStep({ onDone }: { onDone: (name: string) => void }) {
	const [name, setName] = useState("");
	const setUser = useAuthStore((s) => s.setUser);

	const save = useMutation({
		mutationFn: (firstName: string) => withMappedError(() => AccountEndpoints.updateMe({ firstName })),
		meta: { showNotification: true },
		onSuccess: (user, firstName) => {
			setUser(user);
			onDone(firstName);
		},
	});

	const submit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const value = name.trim();
		if (value) save.mutate(value);
		else onDone("");
	};

	return (
		<form className="astep on" id="s3" noValidate onSubmit={submit}>
			<h1>به کیوا خوش اومدی!</h1>
			<p>دوست داری چی صدات کنیم؟ (اختیاری)</p>
			<Input id="name" label="نام" placeholder="مثلاً سارا" autoComplete="given-name" maxLength={50} autoFocus value={name} onChange={(e) => setName(e.target.value)} />
			<button type="submit" className={classNames("btn btn-primary btn-lg btn-block", { loading: save.isPending })} style={{ marginTop: 18 }}>
				ادامه
			</button>
			<button type="button" className="btn btn-link btn-block" id="skip" style={{ marginTop: 12, width: "100%" }} onClick={() => onDone("")}>
				بعداً
			</button>
		</form>
	);
}
