import * as Sentry from "@sentry/react";
import { useEffect } from "react";
import { useParams } from "@tanstack/react-router";

import { SmsPreview } from "@/pages/workflows/ui/workflow-editor/steps/sms/sms-preview";
import { useWorkflow } from "@/pages/workflows/ui/workflow-editor/workflow-provider";
import { usePreviewStep } from "@/shared/lib/hooks/use-preview-step";

export const ConfigureSmsStepPreview = () => {
	const {
		previewStep,
		data: previewData,
		isPending: isPreviewPending,
	} = usePreviewStep({
		onError: (error) => Sentry.captureException(error),
	});
	const { step, isPending } = useWorkflow();

	const { workflowSlug, stepSlug } = useParams({ strict: false }) as {
		workflowSlug: string;
		stepSlug: string;
	};

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
