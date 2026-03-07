import { Card, CardContent } from "@merge-rd/ui/components/card";
import { StepTypeEnum } from "@/shared";
import { Plus } from "@phosphor-icons/react";
import React from "react";
import type { StepType } from "@/features/workflows/ui/step-preview-hover-card";
import { WorkflowStep } from "@/features/workflows/ui/workflow-step";

type WorkflowCardProps = {
	name: string;
	description: string;
	steps?: StepType[];
	onClick?: () => void;
};

export function WorkflowCard({
	name,
	description,
	steps = [
		StepTypeEnum.IN_APP,
		StepTypeEnum.EMAIL,
		StepTypeEnum.SMS,
		StepTypeEnum.PUSH,
	],
	onClick,
}: WorkflowCardProps) {
	return (
		<Card
			className="border-stroke-soft min-h-[120px] w-full min-w-[250px] border shadow-none hover:cursor-pointer"
			onClick={onClick}
		>
			<CardContent className="p-3">
				<div className="overflow-hidden rounded-lg border border-neutral-100">
					<div className="bg-bg-weak relative h-[100px] bg-[url(/images/dots.svg)] bg-cover">
						<div className="flex h-full w-full items-center justify-center">
							{!steps?.length ? (
								<Plus weight="fill" className="text-[#D6D6D6]" />
							) : (
								steps.map((step, index) => (
									<React.Fragment key={index}>
										<WorkflowStep step={step} />
										{index < steps.length - 1 && (
											<div className="h-px w-6 bg-gray-200" />
										)}
									</React.Fragment>
								))
							)}
						</div>
					</div>
				</div>

				<div className="mt-4">
					<h3 className="text-label-sm text-text-strong mb-1">{name}</h3>
					<p className="text-paragraph-xs text-text-sub truncate">
						{description}
					</p>
				</div>
			</CardContent>
		</Card>
	);
}
