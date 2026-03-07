import { Button } from "@merge-rd/ui/components/button";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";

interface CursorPaginationProps {
	hasNext: boolean;
	hasPrevious: boolean;
	onNext: () => void;
	onPrevious: () => void;
	onFirst: () => void;
}

export function CursorPagination({
	hasNext,
	hasPrevious,
	onNext,
	onPrevious,
	onFirst,
}: CursorPaginationProps) {
	return (
		<div className="bottom-0 mt-auto bg-white py-3">
			<div className="border-input flex place-self-center rounded-lg border bg-transparent">
				<Button
					variant="secondary"
					mode="ghost"
					disabled={!hasPrevious}
					onClick={onFirst}
					className="rounded-r-none border-0"
				>
					<div className="flex items-center">
						<CaretLeft className="size-3" />
						<CaretLeft className="-ml-2 size-3" />
					</div>
				</Button>
				<Button
					variant="secondary"
					mode="ghost"
					disabled={!hasPrevious}
					onClick={onPrevious}
					className="border-l-input rounded-none border-0 border-l"
				>
					<CaretLeft className="size-3" />
				</Button>
				<Button
					variant="secondary"
					mode="ghost"
					disabled={!hasNext}
					onClick={onNext}
					className="border-l-input rounded-l-none border-0 border-l"
				>
					<CaretRight className="size-3" />
				</Button>
			</div>
		</div>
	);
}
