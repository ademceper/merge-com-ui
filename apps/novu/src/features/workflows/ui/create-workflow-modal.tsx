/** biome-ignore-all lint/correctness/useUniqueElementIds: working correctly */

import { Button } from "@merge-rd/ui/components/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogOverlay,
	DialogTitle,
} from "@merge-rd/ui/components/dialog";
import { Skeleton } from "@merge-rd/ui/components/skeleton";
import { Separator } from "@merge-rd/ui/components/separator";
import { type DuplicateWorkflowDto } from "@/shared";
import { CaretRight, X } from "@phosphor-icons/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CompactButton } from "@/shared/ui/primitives/button-compact";
import { ExternalLink } from "@/shared/ui/shared/external-link";
import { useEnvironment } from "@/app/context/environment/hooks";
import { CreateWorkflowForm } from "@/features/workflows/ui/workflow-editor/create-workflow-form";
import { useCreateWorkflow } from "@/features/workflows/lib/use-create-workflow";
import { useDuplicateWorkflow } from "@/features/workflows/lib/use-duplicate-workflow";
import { useFetchWorkflow } from "@/features/workflows/lib/use-fetch-workflow";
import { useFormProtection } from "@/shared/lib/hooks/use-form-protection";
import { buildRoute, ROUTES } from "@/shared/lib/routes";

export function CreateWorkflowModal({
	mode,
	workflowId,
}: {
	mode: "create" | "duplicate";
	workflowId?: string;
}) {
	const navigate = useNavigate();
	const { currentEnvironment } = useEnvironment();
	const [open, setOpen] = useState(true);

	const { workflow, isPending: isLoadingWorkflow } = useFetchWorkflow({
		workflowSlug: mode === "duplicate" ? workflowId : undefined,
	});

	const duplicateWorkflow = useDuplicateWorkflow({
		workflowSlug: workflowId || "",
	});
	const createWorkflowHook = useCreateWorkflow();
	const { submit: submitWorkflow, isLoading } =
		mode === "duplicate" ? duplicateWorkflow : createWorkflowHook;

	const isLoadingTemplate = mode === "duplicate" && isLoadingWorkflow;

	const handleClose = (isOpen: boolean) => {
		if (isLoading) return;

		setOpen(isOpen);

		if (!isOpen) {
			setTimeout(() => {
				navigate(
					buildRoute(ROUTES.WORKFLOWS, {
						environmentSlug: currentEnvironment?.slug ?? "",
					}),
				);
			}, 300);
		}
	};

	const { ref, protectedOnValueChange, ProtectionAlert } = useFormProtection({
		onValueChange: handleClose,
	});

	const template: DuplicateWorkflowDto | undefined =
		mode === "duplicate" && workflow
			? {
					name: `${workflow.name} (Copy)`,
					description: workflow.description,
					tags: workflow.tags,
					isTranslationEnabled: workflow.isTranslationEnabled,
				}
			: undefined;

	const isDuplicateMode = mode === "duplicate";
	const title = isDuplicateMode ? "Duplicate workflow" : "Create workflow";
	const buttonText = isDuplicateMode ? "Duplicate workflow" : "Create workflow";

	return (
		<>
			<Dialog open={open} onOpenChange={protectedOnValueChange}>
				<DialogOverlay />
				<DialogContent
					ref={ref}
					className={`flex w-[500px] p-0 flex-col overflow-hidden rounded-xl border border-neutral-100 bg-white shadow-md gap-0`}
					hideCloseButton
				>
					<div className="flex flex-col gap-3 p-3">
						<div className="flex items-start gap-2">
							<div className="flex flex-1 flex-col gap-0.5">
								<DialogTitle className="text-label-md font-medium">
									{title}
								</DialogTitle>
								<DialogDescription className="text-text-soft text-label-xs flex items-center gap-1">
									Turn product activity into messages across channels.{" "}
									<ExternalLink
										href="https://docs.novu.co/platform/concepts/workflows"
										underline={false}
									>
										Learn more
									</ExternalLink>
								</DialogDescription>
							</div>
							<DialogClose asChild>
								<CompactButton size="md" variant="ghost" icon={X}>
									<span className="sr-only">Close</span>
								</CompactButton>
							</DialogClose>
						</div>
					</div>

					<div className="flex flex-col">
						<Separator />

						{isLoadingTemplate ? (
							<ManualModeContentSkeleton />
						) : (
							<ManualModeContent
								onSubmit={submitWorkflow}
								template={template}
							/>
						)}
					</div>

					<div className="border-stroke-soft flex items-center justify-end border-t p-3">
						<Button
							variant="secondary"
							mode="gradient"
							size="xs"
							className="cursor-pointer"
							trailingIcon={CaretRight}
							type="submit"
							form="create-workflow"
							disabled={isLoading || isLoadingTemplate}
							isLoading={isLoading}
						>
							{buttonText}
						</Button>
					</div>
				</DialogContent>
			</Dialog>
			{ProtectionAlert}
		</>
	);
}

type ManualModeContentProps = {
	onSubmit: React.ComponentProps<typeof CreateWorkflowForm>["onSubmit"];
	template?: DuplicateWorkflowDto;
};

function ManualModeContent({ onSubmit, template }: ManualModeContentProps) {
	return (
		<div className="p-3 pt-4">
			<CreateWorkflowForm onSubmit={onSubmit} template={template} />
		</div>
	);
}

function ManualModeContentSkeleton() {
	return (
		<div className="flex flex-col gap-4 p-3 pt-4">
			<div>
				<div className="mb-2">
					<Skeleton className="h-4 w-16" />
				</div>
				<Skeleton className="h-9 w-full" />
			</div>

			<div>
				<div className="mb-2">
					<Skeleton className="h-4 w-24" />
				</div>
				<Skeleton className="h-9 w-full" />
			</div>

			<Separator />

			<div>
				<div className="mb-2">
					<Skeleton className="h-4 w-20" />
				</div>
				<Skeleton className="h-9 w-full" />
			</div>

			<div>
				<div className="mb-2">
					<Skeleton className="h-4 w-24" />
				</div>
				<Skeleton className="h-24 w-full" />
			</div>
		</div>
	);
}
