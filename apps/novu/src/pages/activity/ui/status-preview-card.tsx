import { cn } from "@merge-rd/ui/lib/utils";
import {
	type IActivityJob,
	JobStatusEnum,
	type StepTypeEnum,
} from "@/shared";
import { Check, Pause, SpinnerGap, Stop, XCircle } from "@phosphor-icons/react";
import { format } from "date-fns";
import { STEP_TYPE_TO_ICON } from "@/shared/ui/icons/utils";
import { Badge } from "@/shared/ui/primitives/badge";
import { STEP_TYPE_LABELS } from "@/shared/lib/constants";
import { JOB_STATUS_CONFIG } from "./constants";

function getStepIcon(type?: StepTypeEnum) {
	const Icon = STEP_TYPE_TO_ICON[type as keyof typeof STEP_TYPE_TO_ICON];
	return <Icon className="h-3.5 w-3.5" />;
}

function getStatusIcon(status: JobStatusEnum) {
	switch (status) {
		case JobStatusEnum.COMPLETED:
			return <Check className="h-3 w-3" />;
		case JobStatusEnum.FAILED:
			return <XCircle className="h-3 w-3" />;
		case JobStatusEnum.PENDING:
		case JobStatusEnum.QUEUED:
			return <SpinnerGap className="h-3 w-3 animate-spin" />;
		case JobStatusEnum.CANCELED:
		case JobStatusEnum.SKIPPED:
			return <Stop className="h-3 w-3" />;
		default:
			return <Pause className="h-3 w-3" />;
	}
}

function getStatusVariant(
	status: JobStatusEnum,
): "success" | "destructive" | "warning" | "neutral" {
	switch (status) {
		case JobStatusEnum.COMPLETED:
			return "success";
		case JobStatusEnum.FAILED:
			return "destructive";
		case JobStatusEnum.PENDING:
		case JobStatusEnum.QUEUED:
			return "warning";
		default:
			return "neutral";
	}
}

interface StatusPreviewCardProps {
	jobs: IActivityJob[];
}

export function StatusPreviewCard({ jobs }: StatusPreviewCardProps) {
	return (
		<div className="w-72 p-0">
			<div className="max-h-80 overflow-y-auto">
				<div className="p-1">
					{jobs.map((job) => {
						const lastExecutionDetail = job.executionDetails?.at(-1);
						const status = job.status;
						const statusVariant = getStatusVariant(status);

						return (
							<div
								key={job._id}
								className={cn(
									"group relative flex items-start gap-3 rounded-lg p-2.5 transition-all duration-200",
									"hover:bg-neutral-50 hover:shadow-sm",
								)}
							>
								{/* Step Icon with Status Overlay */}
								<div className="relative shrink-0">
									<div
										className={cn(
											"flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50 transition-all duration-200",
											"group-hover:border-neutral-300 group-hover:shadow-sm",
										)}
									>
										{getStepIcon(job.type)}
									</div>

									{/* Status indicator overlay */}
									<div
										className={cn(
											"absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white",
											status === JobStatusEnum.COMPLETED &&
												"bg-success text-white",
											status === JobStatusEnum.FAILED &&
												"bg-destructive text-white",
											status === JobStatusEnum.PENDING &&
												"bg-warning text-white",
											(status === JobStatusEnum.CANCELED ||
												status === JobStatusEnum.SKIPPED) &&
												"bg-neutral-400 text-white",
										)}
									>
										{getStatusIcon(status)}
									</div>
								</div>

								<div className="min-w-0 flex-1 space-y-1">
									{/* Step Name and Status */}
									<div className="flex items-center justify-between gap-2">
										<span className="text-foreground-950 text-sm font-medium leading-tight">
											{STEP_TYPE_LABELS[job.type!] || job.type}
										</span>
										{job.createdAt && (
											<span className="text-foreground-400 text-xs tabular-nums">
												{format(new Date(job.createdAt), "HH:mm:ss")}
											</span>
										)}
									</div>

									{/* Execution Detail */}
									{lastExecutionDetail?.detail && (
										<div className="text-foreground-600 text-xs leading-relaxed">
											{lastExecutionDetail.detail}
										</div>
									)}

									{/* Status Badge */}
									<div className="flex items-center gap-2">
										<Badge
											size="sm"
											variant="lighter"
											color={
												statusVariant === "success"
													? "green"
													: statusVariant === "destructive"
														? "red"
														: statusVariant === "warning"
															? "yellow"
															: "gray"
											}
											className="text-xs"
										>
											{JOB_STATUS_CONFIG[status]?.label || status}
										</Badge>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			</div>

			{jobs.length > 0 && (
				<div className="border-t border-neutral-100 p-2.5">
					<div className="text-foreground-400 text-center text-xs">
						Click on the workflow run to see more details
					</div>
				</div>
			)}
		</div>
	);
}
