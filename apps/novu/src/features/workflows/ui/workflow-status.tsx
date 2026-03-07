import { CheckCircle, Prohibit, WarningCircle } from "@phosphor-icons/react";
import type { ComponentProps } from "react";
import type { IconType } from "react-icons/lib";
import {
	StatusBadge,
	StatusBadgeIcon,
} from "@/shared/ui/primitives/status-badge";
import { WorkflowIssuesPopover } from "@/features/workflows/ui/workflow-issues-popover";
import { WorkflowStatusEnum } from "@/shared/lib/enums";

// Local type definition for step issues until the shared types are updated
type RuntimeIssue = {
	message: string;
	variableName?: string;
	issueType: string;
};

type StepIssue = {
	controls?: Record<string, RuntimeIssue[]>;
	integration?: Record<string, RuntimeIssue[]>;
};

type StepListItem = {
	slug: string;
	type: string;
	issues?: StepIssue;
};

type WorkflowStatusProps = {
	status: WorkflowStatusEnum;
	steps?: StepListItem[];
};

const statusRenderData: Record<
	WorkflowStatusEnum,
	{
		badgeVariant: ComponentProps<typeof StatusBadge>["status"];
		text: string;
		icon: IconType;
	}
> = {
	[WorkflowStatusEnum.ACTIVE]: {
		badgeVariant: "completed",
		text: "Active",
		icon: CheckCircle,
	},
	[WorkflowStatusEnum.INACTIVE]: {
		badgeVariant: "disabled",
		text: "Inactive",
		icon: Prohibit,
	},
	[WorkflowStatusEnum.ERROR]: {
		badgeVariant: "failed",
		text: "Action required",
		icon: WarningCircle,
	},
};

export const WorkflowStatus = (props: WorkflowStatusProps) => {
	const { status, steps = [] } = props;
	const badgeVariant = statusRenderData[status].badgeVariant;
	const Icon = statusRenderData[status].icon;
	const text = statusRenderData[status].text;

	const statusBadge = (
		<StatusBadge variant="light" status={badgeVariant}>
			<StatusBadgeIcon as={Icon} /> {text}
		</StatusBadge>
	);

	// Show popover only for ERROR status and when there are steps with issues
	if (status === WorkflowStatusEnum.ERROR && steps.length > 0) {
		return (
			<WorkflowIssuesPopover steps={steps}>{statusBadge}</WorkflowIssuesPopover>
		);
	}

	return statusBadge;
};
