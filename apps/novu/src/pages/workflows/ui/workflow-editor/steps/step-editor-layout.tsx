import { Button } from "@merge-rd/ui/components/button";
import { cn } from "@merge-rd/ui/lib/utils";
import {
	PermissionsEnum,
	type StepResponseDto,
	type WorkflowResponseDto,
} from "@/shared";
import {
	CodeBlock,
	Eye,
	PencilSimple,
	PlayCircle,
} from "@phosphor-icons/react";
import { useState } from "react";
import { useParams } from "@tanstack/react-router";
import { IssuesPanel } from "@/widgets/issues-panel";
import { LocaleSelect } from "@/shared/ui/primitives/locale-select";
import { useFetchTranslationGroup } from "@/pages/translations/api/use-fetch-translation-group";
import { useIsTranslationEnabled } from "@/pages/translations/model/use-is-translation-enabled";
import { PreviewContextContainer } from "@/pages/workflows/ui/workflow-editor/steps/context/preview-context-container";
import {
	StepEditorProvider,
	useStepEditor,
} from "@/pages/workflows/ui/workflow-editor/steps/context/step-editor-context";
import { StepEditorFactory } from "@/pages/workflows/ui/workflow-editor/steps/editor/step-editor-factory";
import { useReactEmailStepHint } from "@/pages/workflows/ui/workflow-editor/steps/email/use-react-email-step-hint";
import { PanelHeader } from "@/pages/workflows/ui/workflow-editor/steps/layout/panel-header";
import { ResizableLayout } from "@/pages/workflows/ui/workflow-editor/steps/layout/resizable-layout";
import { StepPreviewFactory } from "@/pages/workflows/ui/workflow-editor/steps/preview/step-preview-factory";
import { parseJsonValue } from "@/pages/workflows/ui/workflow-editor/steps/utils/preview-context.utils";
import { getEditorTitle } from "@/pages/workflows/ui/workflow-editor/steps/utils/step-utils";
import { TestWorkflowDrawer } from "@/pages/workflows/ui/workflow-editor/test-workflow/test-workflow-drawer";
import { TranslationStatus } from "@/pages/workflows/ui/workflow-editor/translation-status";
import { useFetchWorkflowTestData } from "@/pages/workflows/api/use-fetch-workflow-test-data";
import { LocalizationResourceEnum } from "@/shared/model/translations";
import { Protect } from "@/shared/lib/protect";

type StepEditorLayoutProps = {
	workflow: WorkflowResponseDto;
	step: StepResponseDto;
	className?: string;
};

function StepEditorContent() {
	const {
		step,
		isSubsequentLoad,
		editorValue,
		workflow,
		selectedLocale,
		setSelectedLocale,
	} = useStepEditor();
	const emailStepHint = useReactEmailStepHint();
	const editorTitle = getEditorTitle(step.type);
	const { workflowSlug = "" } = useParams({ strict: false }) as { workflowSlug: string };
	const [isTestDrawerOpen, setIsTestDrawerOpen] = useState(false);
	const { testData } = useFetchWorkflowTestData({ workflowSlug });
	const isTranslationsEnabled = useIsTranslationEnabled({
		isTranslationEnabledOnResource: workflow?.isTranslationEnabled ?? false,
	});

	// Fetch translation group to get outdated locales status
	const { data: translationGroup } = useFetchTranslationGroup({
		resourceId: workflow.workflowId,
		resourceType: LocalizationResourceEnum.WORKFLOW,
		enabled: isTranslationsEnabled,
	});

	// Extract available locales from translations
	const availableLocales = translationGroup?.locales || [];

	const handleTestWorkflowClick = () => {
		setIsTestDrawerOpen(true);
	};

	const currentPayload = parseJsonValue(editorValue).payload;

	return (
		<ResizableLayout autoSaveId="step-editor-main-layout">
			<ResizableLayout.ContextPanel>
				<PanelHeader icon={CodeBlock} title="Preview sandbox" className="py-2">
					<Protect permission={PermissionsEnum.EVENT_WRITE}>
						<Button
							variant="secondary"
							size="2xs"
							mode="gradient"
							leadingIcon={PlayCircle}
							onClick={handleTestWorkflowClick}
						>
							Test workflow
						</Button>
					</Protect>
				</PanelHeader>
				<div className="bg-bg-weak flex-1 overflow-hidden">
					<div className="h-full overflow-y-auto">
						<PreviewContextContainer />
					</div>
				</div>
			</ResizableLayout.ContextPanel>

			<ResizableLayout.Handle />

			<ResizableLayout.MainContentPanel>
				<div className="flex min-h-0 flex-1 flex-col">
					<ResizableLayout autoSaveId="step-editor-content-layout">
						<ResizableLayout.EditorPanel>
							<PanelHeader
								icon={() => <PencilSimple />}
								title={editorTitle}
								className="min-h-[45px] py-2"
							>
								<TranslationStatus
									resourceId={workflow.workflowId}
									resourceType={LocalizationResourceEnum.WORKFLOW}
									isTranslationEnabledOnResource={
										!!workflow.isTranslationEnabled
									}
									className="h-7 text-xs"
								/>
							</PanelHeader>
							<div className="flex-1 overflow-y-auto">
								<div className="h-full p-3">
									<StepEditorFactory />
								</div>
							</div>
						</ResizableLayout.EditorPanel>

						<ResizableLayout.Handle />

						<ResizableLayout.PreviewPanel>
							<PanelHeader
								icon={Eye}
								title="Preview"
								isLoading={isSubsequentLoad}
								className="min-h-[45px] py-2"
							>
								{isTranslationsEnabled && availableLocales.length > 0 && (
									<LocaleSelect
										value={selectedLocale}
										onChange={setSelectedLocale}
										placeholder="Select locale"
										availableLocales={availableLocales}
										className="h-7 w-auto min-w-[120px] text-xs"
									/>
								)}
							</PanelHeader>
							<div className="flex-1 overflow-hidden">
								<div
									className="bg-bg-weak relative h-full overflow-y-auto p-3"
									style={{
										backgroundImage:
											"radial-gradient(circle, hsl(var(--neutral-alpha-100)) 1px, transparent 1px)",
										backgroundSize: "20px 20px",
									}}
								>
									<StepPreviewFactory />
								</div>
							</div>
						</ResizableLayout.PreviewPanel>
					</ResizableLayout>
				</div>

				<IssuesPanel
					issues={step.issues}
					isTranslationEnabled={workflow.isTranslationEnabled}
					hintMessage={emailStepHint}
				/>
			</ResizableLayout.MainContentPanel>

			<TestWorkflowDrawer
				isOpen={isTestDrawerOpen}
				onOpenChange={setIsTestDrawerOpen}
				testData={testData}
				initialPayload={currentPayload}
			/>
		</ResizableLayout>
	);
}

export function StepEditorLayout({
	workflow,
	step,
	className,
}: StepEditorLayoutProps) {
	return (
		<div className={cn("h-full w-full", className)}>
			<StepEditorProvider workflow={workflow} step={step}>
				<StepEditorContent />
			</StepEditorProvider>
		</div>
	);
}
