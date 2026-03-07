import { Accordion } from "@merge-rd/ui/components/accordion";
import type { ISubscriberResponseDto } from "@/shared";
import { useCallback } from "react";
import { PreviewContextSection } from "@/widgets/preview-context-section";
import { PreviewSubscriberSection } from "@/widgets/preview-subscriber-section";
import { useEnvironment } from "@/app/context/environment/hooks";
import { useFetchOrganizationSettings } from "@/pages/settings/api/use-fetch-organization-settings";
import { useDefaultSubscriberData } from "@/pages/subscribers/lib/use-default-subscriber-data";
import { createSubscriberData } from "@/pages/workflows/ui/workflow-editor/steps/utils/preview-context.utils";
import { useLayoutEditor } from "./layout-editor-provider";

export const LayoutPreviewContextPanel = () => {
	const {
		layout,
		selectedLocale,
		onLocaleChange,
		accordionValue,
		setAccordionValue,
		updatePreviewSection,
		errors,
		previewContext,
		clearPersistedSubscriber,
		clearPersistedContext,
	} = useLayoutEditor();
	const { data: organizationSettings } = useFetchOrganizationSettings();
	const { currentEnvironment } = useEnvironment();
	const createDefaultSubscriberData = useDefaultSubscriberData(
		undefined,
		organizationSettings?.data?.defaultLocale,
	);

	const handleSubscriberSelection = useCallback(
		(subscriber: ISubscriberResponseDto) => {
			const subscriberData = createSubscriberData(subscriber);
			updatePreviewSection("subscriber", subscriberData);

			if (
				subscriber.locale &&
				subscriber.locale !== selectedLocale &&
				onLocaleChange
			) {
				onLocaleChange(subscriber.locale);
			}
		},
		[updatePreviewSection, onLocaleChange, selectedLocale],
	);

	const handleClearPersistedSubscriber = () => {
		clearPersistedSubscriber();

		updatePreviewSection("subscriber", createDefaultSubscriberData());
	};

	const handleClearPersistedContext = () => {
		clearPersistedContext();

		updatePreviewSection("context", {});
	};

	const canClearPersisted = !!(layout?._id && currentEnvironment?._id);

	return (
		<Accordion
			type="multiple"
			value={accordionValue}
			onValueChange={setAccordionValue}
		>
			<PreviewSubscriberSection
				error={errors.subscriber}
				subscriber={previewContext.subscriber}
				onUpdate={updatePreviewSection}
				onSubscriberSelect={handleSubscriberSelection}
				onClearPersisted={
					canClearPersisted ? handleClearPersistedSubscriber : undefined
				}
			/>

			<PreviewContextSection
				error={errors.context}
				context={previewContext.context}
				onUpdate={updatePreviewSection}
				onClearPersisted={
					canClearPersisted ? handleClearPersistedContext : undefined
				}
			/>
		</Accordion>
	);
};
