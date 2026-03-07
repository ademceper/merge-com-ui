import { Button } from "@merge-rd/ui/components/button";
import { ResourceOriginEnum, type StepResponseDto } from "@novu/shared";
import { CaretRight, Compass } from "@phosphor-icons/react";
import type { RQBJsonLogic } from "react-querybuilder";
import { Link } from "react-router-dom";
import { useConditionsCount } from "@/features/workflows/hooks/use-conditions-count";

export function SkipConditionsButton({
	origin,
	step,
}: {
	origin: ResourceOriginEnum;
	step: StepResponseDto;
}) {
	const canEditStepConditions = origin === ResourceOriginEnum.NOVU_CLOUD;
	const uiSchema = step.controls.uiSchema;
	const skip = uiSchema?.properties?.skip;

	const conditionsCount = useConditionsCount(
		step.controls.values.skip as RQBJsonLogic,
	);

	if (!skip || !canEditStepConditions) {
		return null;
	}

	return (
		<Link to={"./conditions"} relative="path" state={{ stepType: step.type }}>
			<Button
				variant="secondary"
				mode="outline"
				className="flex w-full justify-start gap-1.5 text-xs font-medium"
			>
				<Compass weight="fill" className="h-4 w-4 text-neutral-600" />
				Step Conditions
				{conditionsCount > 0 && (
					<span className="ml-auto flex items-center gap-0.5">
						<span>{conditionsCount}</span>
						<CaretRight className="ml-auto h-4 w-4 text-neutral-600" />
					</span>
				)}
			</Button>
		</Link>
	);
}
