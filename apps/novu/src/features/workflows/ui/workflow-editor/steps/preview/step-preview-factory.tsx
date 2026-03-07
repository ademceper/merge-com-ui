import { ResourceOriginEnum, StepTypeEnum } from "@/shared";
import { memo } from "react";
import { InlineToast } from "@/shared/ui/primitives/inline-toast";
import { ChatPreview } from "@/features/workflows/ui/workflow-editor/steps/chat/chat-preview";
import { useStepEditor } from "@/features/workflows/ui/workflow-editor/steps/context/step-editor-context";
import { InboxPreview } from "@/features/workflows/ui/workflow-editor/steps/in-app/inbox-preview";
import { PushPreview } from "@/features/workflows/ui/workflow-editor/steps/push/push-preview";
import { SmsPreview } from "@/features/workflows/ui/workflow-editor/steps/sms/sms-preview";
import { STEP_TYPE_LABELS } from "@/shared/lib/constants";
import { EmailCorePreview } from "./previews/email-preview-wrapper";

const NoPreviewAvailable = memo(({ stepType }: { stepType: StepTypeEnum }) => {
	return (
		<div className="flex h-full items-center justify-center text-sm text-neutral-500">
			Preview not implemented for {STEP_TYPE_LABELS[stepType]} steps
		</div>
	);
});

const MobilePreviewWrapper = memo(
	({
		children,
		description,
	}: {
		children: React.ReactNode;
		description: string;
	}) => {
		return (
			<div className="flex flex-col items-center justify-center">
				{children}
				<InlineToast description={description} className="w-full px-3" />
			</div>
		);
	},
);

export function StepPreviewFactory() {
	const { step, previewData, isInitialLoad, controlValues } = useStepEditor();

	const commonProps = {
		previewData: previewData ?? undefined,
		isPreviewPending: isInitialLoad,
	};

	const isStepResolver = typeof controlValues?.stepResolverHash === "string";

	const mobilePreviewDescription =
		"This preview shows how your message will appear on mobile. Actual rendering may vary by device.";

	switch (step.type) {
		case StepTypeEnum.EMAIL:
			return (
				<EmailCorePreview
					{...commonProps}
					isCustomHtmlEditor={controlValues?.editorType === "html"}
					resourceOrigin={step.origin ?? ResourceOriginEnum.NOVU_CLOUD}
					isStepResolver={isStepResolver}
				/>
			);

		case StepTypeEnum.IN_APP:
			return <InboxPreview {...commonProps} />;

		case StepTypeEnum.SMS:
			return (
				<MobilePreviewWrapper description={mobilePreviewDescription}>
					<SmsPreview {...commonProps} />
				</MobilePreviewWrapper>
			);

		case StepTypeEnum.PUSH:
			return (
				<MobilePreviewWrapper description={mobilePreviewDescription}>
					<PushPreview {...commonProps} />
				</MobilePreviewWrapper>
			);

		case StepTypeEnum.CHAT:
			return <ChatPreview {...commonProps} />;

		default:
			return <NoPreviewAvailable stepType={step.type} />;
	}
}
