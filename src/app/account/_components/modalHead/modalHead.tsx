import { Icon } from "@/app/_components/icon/icons";

type ModalHeadProps = {
	icon: string;
	tone?: "danger" | "success" | "warn";
	title: string;
	sub?: string;
};

/** `.m-head` — icon tile, title and a line under it (design `A.head`). */
export default function ModalHead({ icon, tone, title, sub }: ModalHeadProps) {
	return (
		<div className="m-head">
			<span className={`m-ic ${tone ?? ""}`}>
				<Icon name={icon} />
			</span>
			<span>
				<h3>{title}</h3>
				{sub && <p>{sub}</p>}
			</span>
		</div>
	);
}
