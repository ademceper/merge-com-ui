import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { Button } from "@merge-rd/ui/components/button";
import { Separator } from "@merge-rd/ui/components/separator";
import {
	EnvironmentTypeEnum,
	type IEnvironment,
	ResourceOriginEnum,
	type StepResponseDto,
	StepTypeEnum,
	type StepUpdateDto,
	type WorkflowResponseDto,
} from "@/shared";
import {
	CaretLeft,
	CaretRight,
	PencilSimple,
	Trash,
	X,
} from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import {
	type HTMLAttributes,
	type ReactNode,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "@tanstack/react-router";
import { ConfirmationModal } from "@/shared/ui/confirmation-modal";
import { PageMeta } from "@/shared/ui/page-meta";
import { CompactButton } from "@/shared/ui/primitives/button-compact";
import { CopyButton } from "@/shared/ui/primitives/copy-button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
	FormRoot,
} from "@/shared/ui/primitives/form/form";
import { Input } from "@/shared/ui/primitives/input";
import {
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
} from "@/widgets/side-navigation/sidebar";
import TruncatedText from "@/shared/ui/truncated-text";
import { stepSchema } from "@/pages/workflows/ui/workflow-editor/schema";
import {
	flattenIssues,
	getFirstErrorMessage,
	updateStepInWorkflow,
} from "@/pages/workflows/ui/workflow-editor/step-utils";
import { ConfigureChatStepPreview } from "@/pages/workflows/ui/workflow-editor/steps/chat/configure-chat-step-preview";
import {
	ConfigureStepTemplateIssueCta,
	ConfigureStepTemplateIssuesContainer,
} from "@/pages/workflows/ui/workflow-editor/steps/configure-step-template-issue-cta";
import { DelayControlValues } from "@/pages/workflows/ui/workflow-editor/steps/delay/delay-control-values";
import { DigestControlValues } from "@/pages/workflows/ui/workflow-editor/steps/digest-delay-tabs/digest-control-values";
import { ConfigureEmailStepPreview } from "@/pages/workflows/ui/workflow-editor/steps/email/configure-email-step-preview";
import { ConfigureInAppStepPreview } from "@/pages/workflows/ui/workflow-editor/steps/in-app/configure-in-app-step-preview";
import { ConfigurePushStepPreview } from "@/pages/workflows/ui/workflow-editor/steps/push/configure-push-step-preview";
import { SaveFormContext } from "@/pages/workflows/ui/workflow-editor/steps/save-form-context";
import { SdkBanner } from "@/pages/workflows/ui/workflow-editor/steps/sdk-banner";
import { SkipConditionsButton } from "@/pages/workflows/ui/workflow-editor/steps/skip-conditions-button";
import { ConfigureSmsStepPreview } from "@/pages/workflows/ui/workflow-editor/steps/sms/configure-sms-step-preview";
import { ThrottleControlValues } from "@/pages/workflows/ui/workflow-editor/steps/throttle/throttle-control-values";
import type { UpdateWorkflowFn } from "@/pages/workflows/ui/workflow-editor/workflow-provider";
import { useFormAutosave } from "@/shared/lib/hooks/use-form-autosave";
import {
	INLINE_CONFIGURABLE_STEP_TYPES,
	STEP_TYPE_LABELS,
	TEMPLATE_CONFIGURABLE_STEP_TYPES,
} from "@/shared/lib/constants";
import { getControlsDefaultValues } from "@/shared/lib/default-values";
import { buildRoute, ROUTES } from "@/shared/lib/routes";

const STEP_TYPE_TO_INLINE_CONTROL_VALUES: Record<
	StepTypeEnum,
	() => React.JSX.Element | null
> = {
	[StepTypeEnum.DELAY]: DelayControlValues,
	[StepTypeEnum.DIGEST]: DigestControlValues,
	[StepTypeEnum.THROTTLE]: ThrottleControlValues,
	[StepTypeEnum.IN_APP]: () => null,
	[StepTypeEnum.EMAIL]: () => null,
	[StepTypeEnum.SMS]: () => null,
	[StepTypeEnum.CHAT]: () => null,
	[StepTypeEnum.PUSH]: () => null,
	[StepTypeEnum.CUSTOM]: () => null,
	[StepTypeEnum.TRIGGER]: () => null,
};

const STEP_TYPE_TO_PREVIEW: Record<
	StepTypeEnum,
	((props: HTMLAttributes<HTMLDivElement>) => ReactNode) | null
> = {
	[StepTypeEnum.IN_APP]: ConfigureInAppStepPreview,
	[StepTypeEnum.EMAIL]: ConfigureEmailStepPreview,
	[StepTypeEnum.SMS]: ConfigureSmsStepPreview,
	[StepTypeEnum.CHAT]: ConfigureChatStepPreview,
	[StepTypeEnum.PUSH]: ConfigurePushStepPreview,
	[StepTypeEnum.CUSTOM]: null,
	[StepTypeEnum.TRIGGER]: null,
	[StepTypeEnum.DIGEST]: null,
	[StepTypeEnum.DELAY]: null,
	[StepTypeEnum.THROTTLE]: null,
};

type ConfigureStepFormProps = {
	workflow: WorkflowResponseDto;
	environment: IEnvironment;
	step: StepResponseDto;
	update: UpdateWorkflowFn;
};

export const ConfigureStepForm = (props: ConfigureStepFormProps) => {
	const { step, workflow, update, environment } = props;
	const navigate = useNavigate();
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const supportedStepTypes = [
		StepTypeEnum.IN_APP,
		StepTypeEnum.SMS,
		StepTypeEnum.CHAT,
		StepTypeEnum.PUSH,
		StepTypeEnum.EMAIL,
		StepTypeEnum.DIGEST,
		StepTypeEnum.DELAY,
		StepTypeEnum.THROTTLE,
	];

	const isSupportedStep = supportedStepTypes.includes(step.type);
	const isReadOnly =
		!isSupportedStep ||
		workflow.origin === ResourceOriginEnum.EXTERNAL ||
		environment.type !== EnvironmentTypeEnum.DEV;

	const isTemplateConfigurableStep =
		isSupportedStep && TEMPLATE_CONFIGURABLE_STEP_TYPES.includes(step.type);
	const isInlineConfigurableStep =
		isSupportedStep && INLINE_CONFIGURABLE_STEP_TYPES.includes(step.type);
	const hasCustomControls =
		Object.keys(step.controls.dataSchema ?? {}).length > 0 &&
		!step.controls.uiSchema;
	const isInlineConfigurableStepWithCustomControls =
		isInlineConfigurableStep && hasCustomControls;

	const onDeleteStep = () => {
		update(
			{
				...workflow,
				steps: workflow.steps.filter((s) => s._id !== step._id),
			},
			{
				onSuccess: () => {
					navigate({
						to: buildRoute(ROUTES.EDIT_WORKFLOW, {
							environmentSlug: environment.slug!,
							workflowSlug: workflow.slug,
						}),
					});
				},
			},
		);
	};

	const registerInlineControlValues = useMemo(() => {
		return (step: StepResponseDto) => {
			if (isInlineConfigurableStep) {
				return {
					controlValues: getControlsDefaultValues(step),
				};
			}

			return {};
		};
	}, [isInlineConfigurableStep]);

	const defaultValues = useMemo(
		() => ({
			name: step.name,
			stepId: step.stepId,
			...registerInlineControlValues(step),
		}),
		[step, registerInlineControlValues],
	);

	const form = useForm({
		defaultValues,
		shouldFocusError: false,
		resolver: standardSchemaResolver(stepSchema),
	});

	const { onBlur, saveForm } = useFormAutosave({
		previousData: defaultValues,
		form,
		isReadOnly,
		shouldClientValidate: true,
		save: (data) => {
			// transform form fields to step update dto
			const updateStepData: Partial<StepUpdateDto> = {
				name: data.name,
				...(data.controlValues ? { controlValues: data.controlValues } : {}),
			};
			update(updateStepInWorkflow(workflow, step.stepId, updateStepData));
		},
	});

	const firstControlsError = useMemo(
		() =>
			step.issues ? getFirstErrorMessage(step.issues, "controls") : undefined,
		[step],
	);
	const firstIntegrationError = useMemo(
		() =>
			step.issues
				? getFirstErrorMessage(step.issues, "integration")
				: undefined,
		[step],
	);

	const setControlValuesIssues = useCallback(() => {
		const stepIssues = flattenIssues(step.issues?.controls);
		const currentErrors = form.formState.errors;

		// Clear errors that are not in stepIssues
		Object.values(currentErrors).forEach((controlValues) => {
			Object.keys(controlValues).forEach((key) => {
				if (!stepIssues[`${key}`]) {
					// @ts-expect-error - dynamic key
					form.clearErrors(`controlValues.${key}`);
				}
			});
		});

		// @ts-expect-error - isNew doesn't exist on StepResponseDto and it's too much work to override the @novu/shared types now. See useUpdateWorkflow.ts for more details
		if (!step.isNew) {
			// Set new errors from stepIssues
			Object.entries(stepIssues).forEach(([key, value]) => {
				// @ts-expect-error - dynamic key
				form.setError(`controlValues.${key}`, { message: value });
			});
		}
	}, [form, step]);

	useEffect(() => {
		setControlValuesIssues();
	}, [setControlValuesIssues]);

	const Preview = STEP_TYPE_TO_PREVIEW[step.type];
	const InlineControlValues = STEP_TYPE_TO_INLINE_CONTROL_VALUES[step.type];

	const value = useMemo(() => ({ saveForm }), [saveForm]);

	return (
		<>
			<PageMeta title={`Configure ${step.name}`} />
			<AnimatePresence>
				<motion.div
					className="flex h-full w-full flex-col"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0.1 }}
					transition={{ duration: 0.1 }}
				>
					<SidebarHeader className="flex items-center gap-2.5 border-b py-3 text-sm font-medium">
						<Link
							to={buildRoute(ROUTES.EDIT_WORKFLOW, {
								environmentSlug: environment.slug!,
								workflowSlug: workflow.slug,
							})}
							className="flex items-center"
						>
							<CompactButton
								size="lg"
								variant="ghost"
								icon={CaretLeft}
								className="size-4"
								type="button"
							>
								<span className="sr-only">Back</span>
							</CompactButton>
						</Link>
						<span>Configure Step</span>
						<Link
							to={buildRoute(ROUTES.EDIT_WORKFLOW, {
								environmentSlug: environment.slug!,
								workflowSlug: workflow.slug,
							})}
							className="ml-auto flex items-center"
						>
							<CompactButton
								size="lg"
								variant="ghost"
								icon={X}
								className="size-4"
								type="button"
								data-testid="configure-step-form-close"
							>
								<span className="sr-only">Close</span>
							</CompactButton>
						</Link>
					</SidebarHeader>
					<Form {...form}>
						<FormRoot onBlur={onBlur}>
							<SaveFormContext.Provider value={value}>
								<SidebarContent>
									<FormField
										control={form.control}
										name="name"
										render={({ field, fieldState }) => (
											<FormItem>
												<FormLabel required>Name</FormLabel>
												<FormControl>
													<Input
														placeholder="Untitled"
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
										name={"stepId"}
										render={({ field }) => (
											<FormItem>
												<FormLabel required>Identifier</FormLabel>
												<FormControl>
													<Input
														trailingNode={
															<CopyButton valueToCopy={field.value} />
														}
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
								</SidebarContent>
								<Separator />

								{isInlineConfigurableStep && !hasCustomControls && (
									<InlineControlValues />
								)}
							</SaveFormContext.Provider>
						</FormRoot>
					</Form>

					{(isTemplateConfigurableStep ||
						isInlineConfigurableStepWithCustomControls) && (
						<>
							<SidebarContent>
								<Link
									to="./editor"
									relative="path"
									state={{ stepType: step.type }}
								>
									<Button
										variant="secondary"
										mode="outline"
										className="flex w-full justify-start gap-1.5 text-xs font-medium"
									>
										<PencilSimple className="h-4 w-4 text-neutral-600" />
										Edit {STEP_TYPE_LABELS[step.type]} Step content{" "}
										<CaretRight className="ml-auto h-4 w-4 text-neutral-600" />
									</Button>
								</Link>

								{environment.type === EnvironmentTypeEnum.DEV && (
									<SkipConditionsButton origin={workflow.origin} step={step} />
								)}
							</SidebarContent>
							<Separator />

							{firstControlsError || firstIntegrationError ? (
								<>
									<ConfigureStepTemplateIssuesContainer>
										{firstControlsError && (
											<ConfigureStepTemplateIssueCta
												step={step}
												issue={firstControlsError}
												type="error"
											/>
										)}
										{firstIntegrationError && (
											<ConfigureStepTemplateIssueCta
												step={step}
												issue={firstIntegrationError}
												type="info"
											/>
										)}
									</ConfigureStepTemplateIssuesContainer>
									<Separator />
								</>
							) : (
								Preview && (
									<>
										<SidebarContent>
											<Preview />
										</SidebarContent>
										<Separator />
									</>
								)
							)}
						</>
					)}

					{isInlineConfigurableStep &&
						environment.type === EnvironmentTypeEnum.DEV && (
							<>
								<SidebarContent>
									<SkipConditionsButton origin={workflow.origin} step={step} />
								</SidebarContent>
								<Separator />
							</>
						)}

					{!isSupportedStep && (
						<SidebarContent>
							<SdkBanner />
						</SidebarContent>
					)}

					{!isReadOnly && (
						<SidebarFooter>
							<ConfirmationModal
								open={isDeleteModalOpen}
								onOpenChange={setIsDeleteModalOpen}
								onConfirm={onDeleteStep}
								title="Proceeding will delete the step"
								description={
									<>
										You're about to delete the{" "}
										<TruncatedText className="max-w-[32ch] font-semibold">
											{step.name}
										</TruncatedText>{" "}
										step, this action is permanent.
									</>
								}
								confirmButtonText="Delete"
								confirmButtonVariant="error"
							/>
							<Button
								variant="error"
								mode="ghost"
								className="gap-1.5"
								type="button"
								onClick={() => setIsDeleteModalOpen(true)}
								leadingIcon={Trash}
							>
								Delete step
							</Button>
						</SidebarFooter>
					)}
				</motion.div>
			</AnimatePresence>
		</>
	);
};
