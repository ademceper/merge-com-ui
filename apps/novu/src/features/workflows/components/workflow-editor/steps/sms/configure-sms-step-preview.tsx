import * as Sentry from "@sentry/react";
import { useEffect } from "react";
import { useParams } from "react-router-dom";

import { SmsPreview } from "@/features/workflows/components/workflow-editor/steps/sms/sms-preview";
import { useWorkflow } from "@/features/workflows/components/workflow-editor/workflow-provider";
import { usePreviewStep } from "@/hooks/use-preview-step";

export const ConfigureSmsStepPreview = () => {
	const {
		previewStep,
		data: previewData,
		isPending: isPreviewPending,
	} = usePreviewStep({
		onError: (error) => Sentry.captureException(error),
	});
	const { step, isPending } = useWorkflow();

	const { workflowSlug, stepSlug } = useParams<{
		workflowSlug: string;
		stepSlug: string;
	}>();

	useEffect(() => {
		if (!workflowSlug || !stepSlug || !step || isPending) return;

		previewStep({
			workflowSlug,
			stepSlug,
			previewData: { controlValues: step.controls.values, previewPayload: {} },
		});
	}, [workflowSlug, stepSlug, previewStep, step, isPending]);

	return (
		<SmsPreview isPreviewPending={isPreviewPending} previewData={previewData} />
	);
};
