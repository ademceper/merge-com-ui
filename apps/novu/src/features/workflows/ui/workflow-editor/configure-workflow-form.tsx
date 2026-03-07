import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useOrganization } from "@merge-rd/auth";
import { Button } from "@merge-rd/ui/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@merge-rd/ui/components/dropdown-menu";
import { Separator } from "@merge-rd/ui/components/separator";
import { Switch } from "@merge-rd/ui/components/switch";
import { cn } from "@merge-rd/ui/lib/utils";
import {
	EnvironmentTypeEnum,
	MAX_DESCRIPTION_LENGTH,
	PermissionsEnum,
	ResourceOriginEnum,
	type UpdateWorkflowDto,
	type WorkflowResponseDto,
} from "@novu/shared";
import {
	CaretRight,
	Code,
	DotsThree,
	Files,
	Gear,
	ListBullets,
	Trash,
} from "@phosphor-icons/react";
import { motion } from "motion/react";
import { useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import type { ExternalToast } from "sonner";
import { ConfirmationModal } from "@/components/confirmation-modal";
import { RouteFill } from "@/components/icons/route-fill";
import { PageMeta } from "@/components/page-meta";
import { CompactButton } from "@/components/primitives/button-compact";
import { CopyButton } from "@/components/primitives/copy-button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
	FormRoot,
} from "@/components/primitives/form/form";
import { Input } from "@/components/primitives/input";
import { ToastIcon } from "@/components/primitives/sonner";
import { showToast } from "@/components/primitives/sonner-helpers";
import { TagInput } from "@/components/primitives/tag-input";
import { Textarea } from "@/components/primitives/textarea";
import { usePromotionalBanner } from "@/components/promotional/coming-soon-banner";
import {
	SidebarContent,
	SidebarHeader,
} from "@/components/side-navigation/sidebar";
import {
	useEnvironment,
	useFetchEnvironments,
} from "@/context/environment/hooks";
import { DeleteWorkflowDialog } from "@/features/workflows/components/delete-workflow-dialog";
import {
	PAUSE_MODAL_TITLE,
	PauseModalDescription,
} from "@/features/workflows/components/pause-workflow-dialog";
import { workflowSchema } from "@/features/workflows/components/workflow-editor/schema";
import type { UpdateWorkflowFn } from "@/features/workflows/components/workflow-editor/workflow-provider";
import { useDeleteWorkflow } from "@/features/workflows/hooks/use-delete-workflow";
import { useSyncWorkflow } from "@/features/workflows/hooks/use-sync-workflow";
import { useFormAutosave } from "@/hooks/use-form-autosave";
import { useTags } from "@/hooks/use-tags";
import { LocalizationResourceEnum } from "@/types/translations";
import { Protect } from "@/utils/protect";
import { buildRoute, ROUTES } from "@/utils/routes";
import { TelemetryEvent } from "@/utils/telemetry";
import { PayloadSchemaDrawer } from "./payload-schema-drawer";
import { TranslationToggleSection } from "./translation-toggle-section";

interface ConfigureWorkflowFormProps {
	workflow: WorkflowResponseDto;
	update: UpdateWorkflowFn;
}

const toastOptions: ExternalToast = {
	position: "bottom-right",
	classNames: {
		toast: "mb-4 right-0",
	},
};

export const ConfigureWorkflowForm = (props: ConfigureWorkflowFormProps) => {
	const { workflow, update } = props;
	const navigate = useNavigate();
	const [isPauseModalOpen, setIsPauseModalOpen] = useState(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [isPayloadSchemaDrawerOpen, setIsPayloadSchemaDrawerOpen] =
		useState(false);

	const { tags } = useTags();
	const { currentEnvironment } = useEnvironment();
	const { organization: currentOrganization } = useOrganization();
	const { environments = [] } = useFetchEnvironments({
		organizationId: currentOrganization?.id,
	});
	const { isSyncable, PromoteConfirmModal } = useSyncWorkflow(workflow);

	const { show: showComingSoonBanner } = usePromotionalBanner({
		content: {
			title: "🚧 Export to Code is on the way!",
			description:
				"With Export to Code, you can design workflows in the GUI and switch to code anytime you need more control and flexibility.",
			feedbackQuestion: "Sounds like a feature you'd need?",
			telemetryEvent: TelemetryEvent.EXPORT_TO_CODE_BANNER_REACTION,
		},
	});

	const isReadOnly =
		workflow.origin === ResourceOriginEnum.EXTERNAL ||
		currentEnvironment?.type !== EnvironmentTypeEnum.DEV;

	const { deleteWorkflow, isPending: isDeleteWorkflowPending } =
		useDeleteWorkflow({
			onSuccess: () => {
				showToast({
					children: () => (
						<>
							<ToastIcon variant="success" />
							<span className="text-sm">
								Deleted workflow{" "}
								<span className="font-bold">{workflow.name}</span>.
							</span>
						</>
					),
					options: toastOptions,
				});
				navigate(ROUTES.WORKFLOWS);
			},
			onError: () => {
				showToast({
					children: () => (
						<>
							<ToastIcon variant="error" />
							<span className="text-sm">
								Failed to delete workflow{" "}
								<span className="font-bold">{workflow.name}</span>.
							</span>
						</>
					),
					options: toastOptions,
				});
			},
		});

	const onDeleteWorkflow = async () => {
		await deleteWorkflow({
			workflowSlug: workflow.slug,
		});
	};

	const form = useForm({
		defaultValues: {
			active: workflow.active,
			name: workflow.name,
			workflowId: workflow.workflowId,
			description: workflow.description,
			tags: workflow.tags,
			isTranslationEnabled: workflow.isTranslationEnabled,
		},
		resolver: standardSchemaResolver(workflowSchema),
		shouldFocusError: false,
	});

	const { onBlur, saveForm } = useFormAutosave({
		previousData: workflow,
		form,
		isReadOnly,
		save: (data) => update(data as UpdateWorkflowDto),
		shouldClientValidate: true,
	});

	const onPauseWorkflow = (active: boolean) => {
		form.setValue("active", active, {
			shouldValidate: true,
			shouldDirty: true,
		});
		saveForm();
	};

	function handleExportToCode() {
		showComingSoonBanner();
	}

	const handleSavePayloadSchema = useCallback(() => {
		showToast({
			children: () => (
				<>
					<ToastIcon variant="success" />
					<span className="text-sm">Payload schema updated.</span>
				</>
			),
			options: toastOptions,
		});
	}, []);

	const _otherEnvironments = environments.filter(
		(env) => env._id !== currentEnvironment?._id,
	);
	const isDuplicable = useMemo(
		() => workflow.origin === ResourceOriginEnum.NOVU_CLOUD,
		[workflow.origin],
	);

	return (
		<>
			<ConfirmationModal
				open={isPauseModalOpen}
				onOpenChange={setIsPauseModalOpen}
				onConfirm={() => {
					onPauseWorkflow(false);
					setIsPauseModalOpen(false);
				}}
				title={PAUSE_MODAL_TITLE}
				description={<PauseModalDescription workflowName={workflow.name} />}
				confirmButtonText="Proceed"
			/>
			<DeleteWorkflowDialog
				workflow={workflow}
				open={isDeleteModalOpen}
				onOpenChange={setIsDeleteModalOpen}
				onConfirm={onDeleteWorkflow}
				isLoading={isDeleteWorkflowPending}
			/>
			<PayloadSchemaDrawer
				workflow={workflow}
				isOpen={isPayloadSchemaDrawerOpen}
				onOpenChange={setIsPayloadSchemaDrawerOpen}
				onSave={handleSavePayloadSchema}
				readOnly={isReadOnly}
			/>
			<PageMeta title={workflow.name} />
			<motion.div
				className={cn("relative flex h-full w-full flex-col")}
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0.1 }}
				transition={{ duration: 0.1 }}
			>
				<SidebarHeader className="items-center border-b py-3 text-sm font-medium">
					<div className="flex items-center gap-1">
						<RouteFill />
						<span>Configure workflow</span>
					</div>
					{/**
					 * Needs modal={false} to prevent the click freeze after the modal is closed
					 */}
					<Protect permission={PermissionsEnum.WORKFLOW_WRITE}>
						<DropdownMenu modal={false}>
							<DropdownMenuTrigger asChild>
								<CompactButton
									size="md"
									icon={DotsThree}
									variant="ghost"
									className="ml-auto"
								>
									<span className="sr-only">More</span>
								</CompactButton>
							</DropdownMenuTrigger>
							<DropdownMenuContent className="w-56">
								<DropdownMenuGroup>
									{isSyncable && (
										<DropdownMenuItem onClick={handleExportToCode}>
											<Code />
											Export to Code
										</DropdownMenuItem>
									)}
									{isDuplicable &&
										currentEnvironment?.type === EnvironmentTypeEnum.DEV && (
											<Link
												to={buildRoute(ROUTES.WORKFLOWS_DUPLICATE, {
													environmentSlug: currentEnvironment?.slug ?? "",
													workflowId: workflow.workflowId,
												})}
											>
												<DropdownMenuItem className="cursor-pointer">
													<Files />
													Duplicate workflow
												</DropdownMenuItem>
											</Link>
										)}
								</DropdownMenuGroup>
								{currentEnvironment?.type === EnvironmentTypeEnum.DEV && (
									<>
										<DropdownMenuSeparator />
										<DropdownMenuGroup className="*:cursor-pointer">
											<DropdownMenuItem
												className="text-destructive"
												disabled={
													workflow.origin === ResourceOriginEnum.EXTERNAL
												}
												onClick={() => {
													setIsDeleteModalOpen(true);
												}}
											>
												<Trash />
												Delete workflow
											</DropdownMenuItem>
										</DropdownMenuGroup>
									</>
								)}
							</DropdownMenuContent>
						</DropdownMenu>
					</Protect>
					<PromoteConfirmModal />
				</SidebarHeader>
				<Form {...form}>
					<FormRoot onBlur={onBlur}>
						<SidebarContent size="md">
							<FormField
								control={form.control}
								name="active"
								render={({ field }) => (
									<FormItem className="flex w-full items-center justify-between">
										<div className="flex items-center gap-4">
											<div
												className="bg-success/60 data-[active=false]:shadow-neutral-alpha-100 ml-2 h-1.5 w-1.5 rounded-full [--pulse-color:var(--success)] data-[active=true]:animate-[pulse-shadow_1s_ease-in-out_infinite] data-[active=false]:bg-neutral-300 data-[active=false]:shadow-[0_0px_0px_5px_var(--neutral-alpha-200),0_0px_0px_9px_var(--neutral-alpha-100)]"
												data-active={field.value}
											/>
											<FormLabel>Active Workflow</FormLabel>
										</div>
										<FormControl>
											<Switch
												checked={field.value}
												onCheckedChange={(checked) => {
													if (!checked) {
														setIsPauseModalOpen(true);
														return;
													}

													onPauseWorkflow(checked);
												}}
												disabled={isReadOnly}
											/>
										</FormControl>
									</FormItem>
								)}
							/>
						</SidebarContent>
						<Separator />
						<SidebarContent>
							<FormField
								control={form.control}
								name="name"
								defaultValue=""
								render={({ field, fieldState }) => (
									<FormItem>
										<FormLabel required>Name</FormLabel>
										<FormControl>
											<Input
												placeholder="New workflow"
												{...field}
												disabled={isReadOnly}
												hasError={!!fieldState.error}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="workflowId"
								defaultValue=""
								render={({ field }) => (
									<FormItem>
										<FormLabel>Identifier</FormLabel>
										<FormControl>
											<Input
												size="xs"
												trailingNode={<CopyButton valueToCopy={field.value} />}
												placeholder="Untitled"
												className="cursor-default"
												{...field}
												readOnly
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="description"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Description</FormLabel>
										<FormControl>
											<Textarea
												className="min-h-36"
												placeholder="Describe what this workflow does"
												{...field}
												maxLength={MAX_DESCRIPTION_LENGTH}
												showCounter
												disabled={isReadOnly}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="tags"
								render={({ field }) => (
									<FormItem className="group" tabIndex={-1}>
										<div className="flex items-center gap-1">
											<FormLabel>Tags</FormLabel>
										</div>
										<FormControl className="text-xs text-neutral-600">
											<TagInput
												{...field}
												onChange={(tags) => {
													form.setValue("tags", tags, {
														shouldValidate: true,
														shouldDirty: true,
													});
													saveForm();
												}}
												disabled={isReadOnly}
												value={field.value ?? []}
												suggestions={tags.map((tag) => tag.name)}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</SidebarContent>
					</FormRoot>
				</Form>
				<Separator />
				<SidebarContent size="lg">
					<Link to={ROUTES.EDIT_WORKFLOW_PREFERENCES}>
						<Button
							variant="secondary"
							mode="outline"
							leadingIcon={Gear}
							className="flex w-full justify-start gap-1.5 p-1.5 text-xs font-medium"
							type="button"
							trailingIcon={CaretRight}
						>
							Configure channel preferences
							<span className="ml-auto" />
						</Button>
					</Link>
					{workflow?.origin === ResourceOriginEnum.NOVU_CLOUD && (
						<Button
							variant="secondary"
							mode="outline"
							leadingIcon={ListBullets}
							className="flex w-full justify-start gap-1.5 p-1.5 text-xs font-medium"
							type="button"
							onClick={() => setIsPayloadSchemaDrawerOpen(true)}
							trailingIcon={CaretRight}
						>
							Manage payload schema
							<span className="ml-auto" />
						</Button>
					)}
					<FormField
						control={form.control}
						name="isTranslationEnabled"
						render={({ field }) => (
							<TranslationToggleSection
								value={field.value ?? false}
								onChange={(checked) => {
									field.onChange(checked);
									saveForm();
								}}
								isReadOnly={isReadOnly}
								resourceId={workflow?.workflowId}
								resourceType={LocalizationResourceEnum.WORKFLOW}
								showDrawer={
									!!(workflow?.workflowId && workflow?.isTranslationEnabled)
								}
							/>
						)}
					/>
				</SidebarContent>
				<Separator />
			</motion.div>
		</>
	);
};
