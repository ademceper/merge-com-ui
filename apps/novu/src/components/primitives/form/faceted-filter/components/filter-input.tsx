import { cn } from "@merge-rd/ui/lib/utils";
import { InputPure } from "@/components/primitives/input";
import { EnterLineIcon } from "../../../../icons/enter-line";
import { STYLES } from "../styles";
import type { SizeType } from "../types";

interface FilterInputProps {
	inputRef: React.RefObject<HTMLInputElement | null>;
	value: string;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	placeholder?: string;
	size: SizeType;
	showEnterIcon?: boolean;
}

export function FilterInput({
	inputRef,
	value,
	onChange,
	placeholder,
	size,
	showEnterIcon = false,
}: FilterInputProps) {
	return (
		<div className="flex items-center gap-2 px-2 py-1">
			<InputPure
				ref={inputRef as React.RefObject<HTMLInputElement>}
				value={value}
				onChange={onChange}
				placeholder={placeholder}
				className={cn(
					"w-full border-none! shadow-none! ring-0!",
					STYLES.size[size].input,
					STYLES.input.base,
					STYLES.input.text,
				)}
			/>
			{showEnterIcon && (
				<div className="pointer-events-none shrink-0 rounded-[6px] border border-neutral-200 p-0.5 dark:border-neutral-700">
					<EnterLineIcon className="h-3 w-3 text-neutral-200 dark:text-neutral-600" />
				</div>
			)}
		</div>
	);
}
