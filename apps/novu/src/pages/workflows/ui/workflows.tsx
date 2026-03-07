import { Button } from "@merge-rd/ui/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@merge-rd/ui/components/dropdown-menu";
import { FacetedFormFilter } from "@merge-rd/ui/components/faceted-filter/faceted-form-filter";
import { ScrollArea, ScrollBar } from "@merge-rd/ui/components/scroll-area";
import { Skeleton } from "@merge-rd/ui/components/skeleton";
import {
	DirectionEnum,
	EnvironmentTypeEnum,
	PermissionsEnum,
	WorkflowStatusEnum,
} from "@/shared";
import {
	CaretDown,
	CaretRight,
	FilePlus,
	FileText,
	Path,
	SpinnerGap,
} from "@phosphor-icons/react";
import { useCallback, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import {
	Outlet,
	useNavigate,
	useParams,
	useSearch,
} from "@tanstack/react-router";
import { PageMeta } from "@/shared/ui/page-meta";
import {
	ButtonGroupItem,
	ButtonGroupRoot,
} from "@/shared/ui/primitives/button-group";
import { LinkButton } from "@/shared/ui/primitives/button-link";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/shared/ui/primitives/tooltip";
import { useEnvironment } from "@/app/context/environment/hooks";
import { useSetPageHeader } from "@/app/context/page-header";
import { selectPopularByIdStrict } from "@/pages/workflows/ui/template-store/featured";
import { WorkflowCard } from "@/pages/workflows/ui/template-store/workflow-card";
import { WorkflowTemplateModal } from "@/pages/workflows/ui/template-store/workflow-template-modal";
import {
	type SortableColumn,
	WorkflowList,
} from "@/pages/workflows/ui/workflow-list";
import { useFetchWorkflows } from "@/pages/workflows/api/use-fetch-workflows";
import {
	type QuickTemplate,
	useTemplateStore,
} from "@/pages/workflows/lib/use-template-store";
import { useDebounce } from "@/shared/lib/hooks/use-debounce";
import { useHasPermission } from "@/shared/lib/hooks/use-has-permission";
import {
	getPersistedPageSize,
	usePersistedPageSize,
} from "@/shared/lib/hooks/use-persisted-page-size";
import { useTags } from "@/shared/lib/hooks/use-tags";
import { useTelemetry } from "@/shared/lib/hooks/use-telemetry";
import { buildRoute, ROUTES } from "@/shared/lib/routes";
import { TelemetryEvent } from "@/shared/lib/telemetry";

const WORKFLOWS_TABLE_ID = "workflows-list";

interface WorkflowFilters {
	query: string;
	tags: string[];
	status: string[];
}

const DEFAULT_PAGE_SIZE = getPersistedPageSize(WORKFLOWS_TABLE_ID, 10);

export const WorkflowsPage = () => {
	useSetPageHeader(
		<h1 className="text-foreground-950 flex items-center gap-1">Workflows</h1>,
	);
	const { environmentSlug } = useParams({ strict: false });
	const track = useTelemetry();
	const navigate = useNavigate();
	const { setPageSize: setPersistedPageSize } = usePersistedPageSize({
		tableId: WORKFLOWS_TABLE_ID,
		defaultPageSize: 10,
	});
	const searchParams = useSearch({ strict: false }) as Record<string, unknown>;
	const form = useForm<WorkflowFilters>({
		defaultValues: {
			query: (searchParams.query as string) || "",
			tags: ((searchParams.tags as string[]) || []),
			status: ((searchParams.status as string[]) || []),
		},
	});

	const updateSearchParams = useCallback(
		(updates: Partial<{ query: string; tags: string[]; status: string[] }>) => {
			navigate({
				search: ((prev: Record<string, unknown>) => {
					const next = { ...prev };

					if ("query" in updates) {
						if (updates.query) {
							next.query = updates.query;
						} else {
							delete next.query;
						}
					}

					if ("tags" in updates) {
						next.tags = updates.tags && updates.tags.length > 0 ? updates.tags : undefined;
					}

					if ("status" in updates) {
						next.status = updates.status && updates.status.length > 0 ? updates.status : undefined;
					}

					return next;
				}) as never,
				replace: true,
			});
		},
		[navigate],
	);

	const debouncedSearch = useDebounce(
		(searchQuery: string) => updateSearchParams({ query: searchQuery }),
		500,
	);

	const clearFilters = () => {
		form.reset({ query: "", tags: [], status: [] });
		updateSearchParams({ query: "", tags: [], status: [] });
	};

	useEffect(() => {
		const subscription = form.watch((value) => {
			const updates: Partial<{
				query: string;
				tags: string[];
				status: string[];
			}> = {};

			if (value.query !== undefined) {
				debouncedSearch(value.query || "");
			}

			if (value.tags !== undefined) {
				updates.tags = value.tags as string[];
			}

			if (value.status !== undefined) {
				updates.status = value.status as string[];
			}

			if (Object.keys(updates).length > 0) {
				updateSearchParams(updates);
			}
		});

		return () => {
			subscription.unsubscribe();
			debouncedSearch.cancel();
		};
	}, [form, debouncedSearch, updateSearchParams]);

	const { quickTemplates, isLoading: isLoadingQuickStart } = useTemplateStore();

	const quickStartTemplates = useMemo(() => {
		const popularByTag = quickTemplates
			.filter(
				(template) =>
					Array.isArray(template.tags) && template.tags.includes("popular"),
			)
			.slice(0, 4);

		if (popularByTag.length > 0) {
			return popularByTag;
		}

		const popularByLegacy = selectPopularByIdStrict(
			quickTemplates,
			(template) => template.workflowId,
			4,
		);
		return popularByLegacy.length
			? popularByLegacy
			: quickTemplates.slice(0, 4);
	}, [quickTemplates]);

	const offset = parseInt(String(searchParams.offset || "0"), 10);
	const limit = parseInt(
		String(searchParams.limit || DEFAULT_PAGE_SIZE.toString()),
		10,
	);

	const {
		data: workflowsData,
		isPending,
		isFetching,
		isError,
	} = useFetchWorkflows({
		limit,
		offset,
		orderBy: (searchParams.orderBy as SortableColumn) || undefined,
		orderDirection: (searchParams.orderDirection as DirectionEnum) || undefined,
		query: (searchParams.query as string) || "",
		tags: (searchParams.tags as string[]) || [],
		status: (searchParams.status as string[]) || [],
	});

	const { currentEnvironment } = useEnvironment();
	const { tags } = useTags();

	const queryParam = (searchParams.query as string) || "";
	const hasActiveFilters =
		queryParam.trim() !== "" ||
		((searchParams.tags as string[]) || []).length > 0 ||
		((searchParams.status as string[]) || []).length > 0;

	const isDevEnvironment = currentEnvironment?.type === EnvironmentTypeEnum.DEV;

	const shouldShowStartWithTemplatesSection =
		workflowsData &&
		workflowsData.totalCount < 5 &&
		!hasActiveFilters &&
		isDevEnvironment;

	useEffect(() => {
		track(TelemetryEvent.WORKFLOWS_PAGE_VISIT);
	}, [track]);

	const handleTemplateClick = (template: QuickTemplate) => {
		track(TelemetryEvent.TEMPLATE_WORKFLOW_CLICK);

		navigate({
			to: buildRoute(ROUTES.TEMPLATE_STORE_CREATE_WORKFLOW, {
				environmentSlug: environmentSlug || "",
				templateId: template.workflowId,
			}),
			search: { source: "template-store-card-row" },
		});
	};

	return (
		<>
			<PageMeta title="Workflows" />
			<div className="flex h-full w-full flex-col">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2 py-2.5">
						<FacetedFormFilter
							type="text"
							size="small"
							title="Search"
							value={form.watch("query") || ""}
							onChange={(value) => {
								form.setValue("query", value || "");
							}}
							placeholder="Search workflows..."
						/>
						<FacetedFormFilter
							size="small"
							type="multi"
							title="Tags"
							placeholder="Filter by tags"
							options={
								tags?.map((tag) => ({ label: tag.name, value: tag.name })) || []
							}
							selected={form.watch("tags")}
							onSelect={(values) => {
								form.setValue("tags", values, {
									shouldDirty: true,
									shouldTouch: true,
								});
							}}
						/>
						<FacetedFormFilter
							size="small"
							type="multi"
							title="Status"
							placeholder="Filter by status"
							options={[
								{ label: "Active", value: WorkflowStatusEnum.ACTIVE },
								{ label: "Inactive", value: WorkflowStatusEnum.INACTIVE },
								{ label: "Error", value: WorkflowStatusEnum.ERROR },
							]}
							selected={form.watch("status")}
							onSelect={(values) => {
								form.setValue("status", values, {
									shouldDirty: true,
									shouldTouch: true,
								});
							}}
						/>

						{hasActiveFilters && (
							<div className="flex items-center gap-1">
								<Button
									variant="secondary"
									mode="ghost"
									size="2xs"
									onClick={clearFilters}
								>
									Reset
								</Button>
								{isFetching && !isPending && (
									<SpinnerGap className="h-3 w-3 animate-spin text-neutral-400" />
								)}
							</div>
						)}
					</div>
					<CreateWorkflowButton />
				</div>
				{shouldShowStartWithTemplatesSection && (
					<div className="mb-2">
						<div className="my-2 flex items-center justify-between">
							<div className="text-label-xs text-text-soft">Quick start</div>
							<LinkButton
								size="sm"
								variant="gray"
								onClick={() =>
									navigate({
										to: buildRoute(ROUTES.TEMPLATE_STORE, {
											environmentSlug: environmentSlug || "",
										}),
										search: { source: "start-with" },
									})
								}
								trailingIcon={CaretRight}
							>
								Explore templates
							</LinkButton>
						</div>
						<ScrollArea className="w-full">
							<div className="bg-bg-weak rounded-12 flex gap-4 p-3">
								{isLoadingQuickStart && (
									<>
										<Skeleton className="h-[140px] w-[250px] shrink-0" />
										<Skeleton className="h-[140px] w-[250px] shrink-0" />
										<Skeleton className="h-[140px] w-[250px] shrink-0" />
										<Skeleton className="h-[140px] w-[250px] shrink-0" />
										<Skeleton className="h-[140px] w-[250px] shrink-0" />
									</>
								)}
								{!isLoadingQuickStart && (
									<>
										<div className="w-[250px] shrink-0">
											<WorkflowCard
												name="Start from scratch"
												description="Create a workflow from scratch"
												steps={[]}
												onClick={() => {
													track(TelemetryEvent.CREATE_WORKFLOW_CLICK);
													navigate({
														to: buildRoute(ROUTES.WORKFLOWS_CREATE, {
															environmentSlug: environmentSlug || "",
														}),
													});
												}}
											/>
										</div>
										{quickStartTemplates.map((template) => (
											<div
												key={template.workflowId}
												className="w-[250px] shrink-0"
											>
												<WorkflowCard
													name={template.name}
													description={template.description}
													steps={template.steps}
													onClick={() => handleTemplateClick(template)}
												/>
											</div>
										))}
									</>
								)}
							</div>
							<ScrollBar orientation="horizontal" />
						</ScrollArea>
					</div>
				)}
				{shouldShowStartWithTemplatesSection && (
					<div className="text-label-xs text-text-soft my-2">
						Your Workflows
					</div>
				)}
				<WorkflowList
					hasActiveFilters={!!hasActiveFilters}
					onClearFilters={clearFilters}
					orderBy={(searchParams.orderBy as SortableColumn) || undefined}
					orderDirection={(searchParams.orderDirection as DirectionEnum) || undefined}
					data={workflowsData}
					isLoading={isPending}
					isError={isError}
					limit={limit}
					onPageSizeChange={(newPageSize) => {
						setPersistedPageSize(newPageSize);
						navigate({
							search: ((prev: Record<string, unknown>) => ({
								...prev,
								limit: newPageSize,
								offset: undefined,
							})) as never,
							replace: true,
						});
					}}
				/>
			</div>
			<Outlet />
		</>
	);
};

const CreateWorkflowButton = () => {
	const navigate = useNavigate();
	const { environmentSlug } = useParams({ strict: false });
	const track = useTelemetry();
	const has = useHasPermission();
	const { currentEnvironment } = useEnvironment();

	const handleCreateWorkflow = (
		event: Pick<Event, "preventDefault" | "stopPropagation">,
	) => {
		event.preventDefault();
		event.stopPropagation();
		track(TelemetryEvent.CREATE_WORKFLOW_CLICK);
		navigate({
			to: buildRoute(ROUTES.WORKFLOWS_CREATE, {
				environmentSlug: environmentSlug || "",
			}),
		});
	};

	const navigateToTemplateStore = (
		event: Pick<Event, "preventDefault" | "stopPropagation">,
	) => {
		event.preventDefault();
		event.stopPropagation();
		navigate({
			to: buildRoute(ROUTES.TEMPLATE_STORE, {
				environmentSlug: environmentSlug || "",
			}),
			search: { source: "create-workflow-dropdown" },
		});
	};

	const canCreateWorkflow = has({ permission: PermissionsEnum.WORKFLOW_WRITE });

	if (
		!canCreateWorkflow ||
		currentEnvironment?.type !== EnvironmentTypeEnum.DEV
	) {
		return (
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						className="text-label-xs gap-1 rounded-lg p-2"
						variant="primary"
						disabled
						size="xs"
						leadingIcon={Path}
					>
						Create workflow
					</Button>
				</TooltipTrigger>
				<TooltipContent>
					{currentEnvironment?.type !== EnvironmentTypeEnum.DEV
						? "Create the workflow in your development environment."
						: "Almost there! Your role just doesn't have permission for this one."}{" "}
					{currentEnvironment?.type === EnvironmentTypeEnum.DEV && (
						<a
							href="https://docs.novu.co/platform/account/roles-and-permissions"
							target="_blank"
							className="underline"
							rel="noopener"
						>
							Learn More ↗
						</a>
					)}
				</TooltipContent>
			</Tooltip>
		);
	}

	return (
		<ButtonGroupRoot size="xs">
			<ButtonGroupItem asChild className="gap-1">
				<Button
					mode="gradient"
					className="text-label-xs rounded-l-lg rounded-r-none border-none p-2 text-white"
					variant="primary"
					size="xs"
					leadingIcon={Path}
					onClick={handleCreateWorkflow}
				>
					Create workflow
				</Button>
			</ButtonGroupItem>
			<ButtonGroupItem asChild>
				<DropdownMenu modal={false}>
					<DropdownMenuTrigger asChild>
						<Button
							mode="gradient"
							className="rounded-l-none rounded-r-lg border-none px-1.5 text-white"
							variant="primary"
							size="xs"
							leadingIcon={CaretDown}
						></Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent className="w-56">
						<DropdownMenuItem
							className="cursor-pointer"
							onSelect={handleCreateWorkflow}
						>
							<FilePlus />
							From Blank
						</DropdownMenuItem>
						<DropdownMenuItem
							className="cursor-pointer"
							onSelect={navigateToTemplateStore}
						>
							<FileText />
							From Template
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</ButtonGroupItem>
		</ButtonGroupRoot>
	);
};

export const TemplateModal = () => {
	const navigate = useNavigate();
	const { environmentSlug } = useParams({ strict: false });

	const handleCloseTemplateModal = () => {
		navigate({
			to: buildRoute(ROUTES.WORKFLOWS, { environmentSlug: environmentSlug || "" }),
		});
	};

	return (
		<WorkflowTemplateModal
			open={true}
			onOpenChange={(isOpen) => {
				if (!isOpen) {
					handleCloseTemplateModal();
				}
			}}
		/>
	);
};
