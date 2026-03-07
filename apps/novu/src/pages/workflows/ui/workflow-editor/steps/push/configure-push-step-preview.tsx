import * as Sentry from "@sentry/react";
import { useEffect } from "react";
import { useParams } from "@tanstack/react-router";
import { usePreviewStep } from "@/shared/lib/hooks/use-preview-step";
import { useWorkflow } from "../../workflow-provider";
import { PushPreview } from "./push-preview";

export function ConfigurePushStepPreview() {
	const {
		previewStep,
		data: previewData,
		isPending: isPreviewPending,
	} = usePreviewStep({
		onError: (error) => {
			Sentry.captureException(error);
		},
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
		<PushPreview
			previewData={previewData}
			isPreviewPending={isPreviewPending}
		/>
	);
}
