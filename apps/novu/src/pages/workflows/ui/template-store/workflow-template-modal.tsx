import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@merge-rd/ui/components/breadcrumb";
import { Button } from "@merge-rd/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@merge-rd/ui/components/dialog";
import { ScrollArea, ScrollBar } from "@merge-rd/ui/components/scroll-area";
import { Skeleton } from "@merge-rd/ui/components/skeleton";
import type { StepCreateDto } from "@/shared";
import { CaretLeft } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearch } from "@tanstack/react-router";
import type { z } from "zod";
import { RouteFill } from "@/shared/ui/icons/route-fill";
import { CompactButton } from "@/shared/ui/primitives/button-compact";
import TruncatedText from "@/shared/ui/truncated-text";
import { WorkflowResults } from "@/pages/workflows/ui/template-store/components/workflow-results";
import type { IWorkflowSuggestion } from "@/pages/workflows/ui/template-store/types";
import { WorkflowSidebar } from "@/pages/workflows/ui/template-store/workflow-sidebar";
import { CreateWorkflowForm } from "@/pages/workflows/ui/workflow-editor/create-workflow-form";
import type { workflowSchema } from "@/pages/workflows/ui/workflow-editor/schema";
import { showErrorToast } from "@/pages/workflows/ui/workflow-editor/toasts";
import { WorkflowCanvas } from "@/pages/workflows/ui/workflow-editor/workflow-canvas";
import { useCreateWorkflow } from "@/pages/workflows/api/use-create-workflow";
import { useTemplateStore } from "@/pages/workflows/lib/use-template-store";
import { useTelemetry } from "@/shared/lib/hooks/use-telemetry";
import { buildRoute, ROUTES } from "@/shared/lib/routes";
import { TelemetryEvent } from "@/shared/lib/telemetry";
import type { Step } from "@/shared/lib/types";

function mapTemplateStepsToSteps(templateSteps: StepCreateDto[]): Step[] {
	return templateSteps.map((step, index) => {
		const mappedStep: Step = {
			name: step.name || `Step ${index + 1}`,
			type: step.type,
			_id: `temp-${index}`,
			stepId: step.name || `step-${index}`,
			slug: `template-step-${index}_st_temp` as const,
			controls: {
				values: step.controlValues ?? {},
			},
			issues: undefined,
		};

		return mappedStep;
	});
}

type WorkflowTemplateModalProps = {
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	selectedTemplate?: IWorkflowSuggestion;
};

export function WorkflowTemplateModal(props: WorkflowTemplateModalProps) {
	const track = useTelemetry();
	const navigate = useNavigate();
	const { environmentSlug, templateId } = useParams({ strict: false });
	const searchParams = useSearch({ strict: false }) as Record<string, unknown>;
	const { submit: createFromTemplate, isLoading: isCreating } =
		useCreateWorkflow();
	const [selectedCategory, setSelectedCategory] = useState<string>("popular");
	const [internalSelectedTemplate, setInternalSelectedTemplate] =
		useState<IWorkflowSuggestion | null>(null);

	const selectedTemplate = props.selectedTemplate ?? internalSelectedTemplate;

	const { suggestions, isLoading } = useTemplateStore();
	const previewSteps = useMemo(() => {
		if (!selectedTemplate) return [] as Step[];
		return mapTemplateStepsToSteps(selectedTemplate.workflowDefinition.steps);
	}, [selectedTemplate]);

	const filteredSuggestions = useMemo(() => {
		if (selectedCategory === "popular") {
			const popularWorkflows = suggestions.filter((suggestion) =>
				suggestion.tags.includes("popular"),
			);
			return popularWorkflows.length > 0
				? popularWorkflows
				: suggestions.slice(0, 12);
		}

		return suggestions.filter((suggestion) =>
			suggestion.tags.includes(selectedCategory),
		);
	}, [selectedCategory, suggestions]);

	useEffect(() => {
		if (props.open) {
			track(TelemetryEvent.TEMPLATE_MODAL_OPENED, {
				source: (searchParams.source as string) || "unknown",
			});
		}
	}, [props.open, track, searchParams]);

	useEffect(() => {
		if (props.selectedTemplate) {
			setInternalSelectedTemplate(props.selectedTemplate);
		}
	}, [props.selectedTemplate]);

	useEffect(() => {
		if (!templateId || selectedTemplate) return;
		const match = suggestions.find(
			(s) => s.workflowDefinition.workflowId === templateId,
		);
		if (match) setInternalSelectedTemplate(match);
	}, [templateId, suggestions, selectedTemplate]);

	const handleCreateWorkflow = (values: z.infer<typeof workflowSchema>) => {
		if (!selectedTemplate) return;

		createFromTemplate(values, selectedTemplate.workflowDefinition)
			.then(() => {
				track(TelemetryEvent.CREATE_WORKFLOW_FROM_TEMPLATE, {
					templateId: selectedTemplate.id,
					templateName: selectedTemplate.name,
					category: selectedCategory,
				});
			})
			.catch((error: unknown) => {
				const message =
					typeof error === "object" && error !== null && "message" in error
						? String(
								(error as { message?: unknown }).message || "",
							).toLowerCase()
						: "";
				const status =
					typeof error === "object" && error !== null && "status" in error
						? Number((error as { status?: unknown }).status)
						: undefined;

				const isLayoutMissing =
					message.includes("layout not found") || status === 404;

				if (isLayoutMissing) {
					navigate({
						to: buildRoute(ROUTES.EDIT_WORKFLOW, {
							environmentSlug: environmentSlug || "",
							workflowSlug: values.workflowId,
						}),
					});
					return;
				}
				showErrorToast(undefined, error);
			});
	};

	const getHeaderText = () => {
		if (selectedTemplate) {
			return selectedTemplate.name;
		}

		return `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} workflows`;
	};

	const handleTemplateClick = (template: IWorkflowSuggestion) => {
		setInternalSelectedTemplate(template);
	};

	const handleBackClick = () => {
		navigate({
			to: buildRoute(ROUTES.TEMPLATE_STORE, {
				environmentSlug: environmentSlug || "",
			}),
		});
		setInternalSelectedTemplate(null);
	};

	const handleCategorySelect = (category: string) => {
		setSelectedCategory(category);
		track(TelemetryEvent.TEMPLATE_CATEGORY_SELECTED, {
			category,
		});
	};

	return (
		<Dialog open={props.open} onOpenChange={props.onOpenChange}>
			<DialogContent className="w-full max-w-[1240px] gap-0 p-0">
				<DialogHeader className="border-stroke-soft flex flex-row items-center gap-1 border-b p-3">
					<DialogTitle className="sr-only">Workflow Templates</DialogTitle>
					{selectedTemplate ? (
						<CompactButton
							size="md"
							variant="ghost"
							onClick={handleBackClick}
							icon={CaretLeft}
						></CompactButton>
					) : null}
					<Breadcrumb className="mt-0!">
						<BreadcrumbList>
							{selectedTemplate && (
								<>
									<BreadcrumbItem
										onClick={handleBackClick}
										className="flex items-center gap-1 hover:cursor-pointer"
									>
										Templates
									</BreadcrumbItem>
									<BreadcrumbSeparator />
								</>
							)}
							<BreadcrumbItem>
								<BreadcrumbPage className="flex items-center gap-1">
									<RouteFill className="size-4" />
									<div className="flex max-w-[32ch]">
										<TruncatedText>{getHeaderText()}</TruncatedText>
									</div>
								</BreadcrumbPage>
							</BreadcrumbItem>
						</BreadcrumbList>
					</Breadcrumb>
				</DialogHeader>
				<div
					className={`flex ${selectedTemplate ? "min-h-[600px]" : "min-h-[640px]"}`}
				>
					{!selectedTemplate && (
						<AnimatePresence initial={false} mode="wait">
							{isLoading ? (
								<motion.div
									key="sidebar-skeleton"
									initial={{ opacity: 0, y: 6 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -6 }}
									transition={{ duration: 0.18, ease: "easeOut" }}
									className="flex h-full w-[240px] flex-col gap-4 border-r p-2"
								>
									<div className="flex flex-col gap-1">
										<Skeleton className="h-9 w-full" />
										<Skeleton className="h-9 w-full" />
									</div>

									<section className="p-2">
										<div className="mb-2">
											<Skeleton className="h-3 w-16" />
										</div>
										<div className="flex flex-col gap-2">
											<Skeleton className="h-8 w-full" />
											<Skeleton className="h-8 w-full" />
											<Skeleton className="h-8 w-full" />
											<Skeleton className="h-8 w-full" />
											<Skeleton className="h-8 w-full" />
											<Skeleton className="h-8 w-full" />
										</div>
									</section>

									<div className="mt-auto p-3">
										<Skeleton className="h-[72px] w-full" />
									</div>
								</motion.div>
							) : (
								<motion.div
									key="sidebar-content"
									initial={{ opacity: 0, y: 6 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -6 }}
									transition={{ duration: 0.18, ease: "easeOut" }}
								>
									<WorkflowSidebar
										selectedCategory={selectedCategory}
										onCategorySelect={handleCategorySelect}
									/>
								</motion.div>
							)}
						</AnimatePresence>
					)}

					<div className="w-full flex-1 overflow-auto">
						{!selectedTemplate ? (
							<div className="p-3">
								<div className="mb-1.5 flex items-center justify-between">
									<h2 className="text-label-md text-strong">
										{getHeaderText()}
									</h2>
								</div>

								<ScrollArea className="h-[520px]">
									<div className="pr-2">
										{!suggestions.length ? (
											<div className="grid grid-cols-3 gap-4">
												<Skeleton className="h-[140px] w-full" />
												<Skeleton className="h-[140px] w-full" />
												<Skeleton className="h-[140px] w-full" />
												<Skeleton className="h-[140px] w-full" />
												<Skeleton className="h-[140px] w-full" />
												<Skeleton className="h-[140px] w-full" />
											</div>
										) : (
											<WorkflowResults
												suggestions={filteredSuggestions}
												onClick={handleTemplateClick}
											/>
										)}
									</div>
									<ScrollBar orientation="vertical" />
								</ScrollArea>
							</div>
						) : (
							<div className="flex h-full w-full gap-4">
								<div className="flex-1">
									<WorkflowCanvas
										isReadOnly
										showStepPreview
										steps={previewSteps}
									/>
								</div>
								<div className="border-stroke-soft w-full max-w-[300px] border-l p-3">
									<CreateWorkflowForm
										onSubmit={handleCreateWorkflow}
										template={selectedTemplate.workflowDefinition}
									/>
								</div>
							</div>
						)}
					</div>
				</div>

				{selectedTemplate && (
					<DialogFooter className="border-stroke-soft mx-0! border-t p-1.5!">
						<Button
							className="ml-auto"
							mode="gradient"
							type="submit"
							form="create-workflow"
							isLoading={isCreating}
						>
							Create workflow
						</Button>
					</DialogFooter>
				)}
			</DialogContent>
		</Dialog>
	);
}
