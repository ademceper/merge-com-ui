import { Eye, EyeSlash } from "@phosphor-icons/react";
import { useState } from "react";
import { Input, type InputProps } from "@/components/primitives/input";
import { CopyButton } from "./copy-button";

interface SecretInputProps extends Omit<InputProps, "onChange"> {
	value: string;
	onChange: (value: string) => void;
	copyButton?: boolean;
}

export function SecretInput({
	className,
	value,
	onChange,
	copyButton = false,
	...props
}: SecretInputProps) {
	const [revealed, setRevealed] = useState(false);

	return (
		<Input
			type={revealed ? "text" : "password"}
			value={value}
			onChange={(e) => onChange(e.target.value)}
			{...props}
			inlineTrailingNode={
				<button type="button" onClick={() => setRevealed(!revealed)}>
					{revealed ? (
						<EyeSlash className="text-text-soft group-has-[disabled]:text-text-disabled size-5" />
					) : (
						<Eye className="text-text-soft group-has-[disabled]:text-text-disabled size-5" />
					)}
				</button>
			}
			trailingNode={
				copyButton ? <CopyButton valueToCopy={value ?? ""} /> : null
			}
		/>
	);
}
