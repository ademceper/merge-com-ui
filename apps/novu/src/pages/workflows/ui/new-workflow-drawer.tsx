import { Button } from "@merge-rd/ui/components/button";
import { Separator } from "@merge-rd/ui/components/separator";
import { Skeleton } from "@merge-rd/ui/components/skeleton";
import type { DuplicateWorkflowDto } from "@/shared";
import { CaretRight } from "@phosphor-icons/react";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetMain,
	SheetTitle,
} from "@/shared/ui/primitives/sheet";
import { ExternalLink } from "@/shared/ui/shared/external-link";
import { useEnvironment } from "@/app/context/environment/hooks";
import { CreateWorkflowForm } from "@/pages/workflows/ui/workflow-editor/create-workflow-form";
import { useCreateWorkflow } from "@/pages/workflows/api/use-create-workflow";
import { useDuplicateWorkflow } from "@/pages/workflows/api/use-duplicate-workflow";
import { useFetchWorkflow } from "@/pages/workflows/api/use-fetch-workflow";
import { useOnElementUnmount } from "@/shared/lib/hooks/use-on-element-unmount";
import { buildRoute, ROUTES } from "@/shared/lib/routes";

type NewWorkflowDrawerProps = {
	mode: "create" | "duplicate";
	workflowId?: string;
};

export function NewWorkflowDrawer({
	mode,
	workflowId,
}: NewWorkflowDrawerProps) {
	const navigate = useNavigate();
	const { currentEnvironment } = useEnvironment();
	const [open, setOpen] = useState(true);

	const { workflow, isPending: isLoadingWorkflow } = useFetchWorkflow({
		workflowSlug: mode === "duplicate" ? workflowId : undefined,
	});

	const duplicateWorkflow = useDuplicateWorkflow({
		workflowSlug: workflowId || "",
	});
	const createWorkflow = useCreateWorkflow();
	const { submit, isLoading: isSubmitting } =
		mode === "duplicate" ? duplicateWorkflow : createWorkflow;

	const { ref: unmountRef } = useOnElementUnmount({
		callback: () => {
			navigate({
				to: buildRoute(ROUTES.WORKFLOWS, {
					environmentSlug: currentEnvironment?.slug ?? "",
				}),
			});
		},
		condition: !open,
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

	const title = mode === "create" ? "Create workflow" : "Duplicate workflow";
	const buttonText =
		mode === "create" ? "Create workflow" : "Duplicate workflow";
	const isLoadingTemplate = mode === "duplicate" && isLoadingWorkflow;

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetContent ref={unmountRef}>
				<SheetHeader>
					<SheetTitle>{title}</SheetTitle>
					<div>
						<SheetDescription>
							Define the steps to notify subscribers using channels like in-app,
							email, and more.{" "}
							<ExternalLink href="https://docs.novu.co/platform/concepts/workflows">
								Learn more
							</ExternalLink>
						</SheetDescription>
					</div>
				</SheetHeader>
				<Separator />
				<SheetMain>
					{isLoadingTemplate ? (
						<CreateWorkflowFormSkeleton />
					) : (
						<CreateWorkflowForm onSubmit={submit} template={template} />
					)}
				</SheetMain>
				<Separator />
				<SheetFooter>
					<Button
						isLoading={isSubmitting}
						trailingIcon={CaretRight}
						variant="secondary"
						mode="gradient"
						type="submit"
						form="create-workflow"
					>
						{buttonText}
					</Button>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}

function CreateWorkflowFormSkeleton() {
	return (
		<div className="flex flex-col gap-4">
			<div>
				<div className="mb-2">
					<Skeleton className="h-4 w-16" /> {/* Name label */}
				</div>
				<Skeleton className="h-9 w-full" /> {/* Name input */}
			</div>

			<div>
				<div className="mb-2">
					<Skeleton className="h-4 w-24" /> {/* Identifier label */}
				</div>
				<Skeleton className="h-9 w-full" /> {/* Identifier input */}
			</div>

			<Separator />

			<div>
				<div className="mb-2">
					<Skeleton className="h-4 w-20" /> {/* Tags label */}
				</div>
				<Skeleton className="h-9 w-full" /> {/* Tags input */}
			</div>

			<div>
				<div className="mb-2">
					<Skeleton className="h-4 w-24" /> {/* Description label */}
				</div>
				<Skeleton className="h-24 w-full" /> {/* Description textarea */}
			</div>
		</div>
	);
}
