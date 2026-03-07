import type { EditorView } from "@uiw/react-codemirror";
import { useCallback, useEffect, useState } from "react";
import { TRANSLATION_PILL_HEIGHT } from "@/shared/ui/primitives/translation-plugin/pill-widget";
import type { CompletionRange } from "@/shared/ui/primitives/variable-editor";
import { useIsTranslationEnabled } from "@/features/translations/lib/use-is-translation-enabled";
import { useTranslationCompletionSource } from "@/features/translations/lib/use-translation-completion-source";
import { useTranslationPluginExtension } from "@/features/translations/lib/use-translation-plugin-extension";
import type { LocalizationResourceEnum } from "@/shared/model/translations";

type UseTranslationEditorProps = {
	viewRef: React.MutableRefObject<EditorView | null>;
	lastCompletionRef: React.MutableRefObject<CompletionRange | null>;
	onChange: (value: string) => void;
	resourceId: string;
	resourceType: LocalizationResourceEnum;
	enableTranslations?: boolean;
	isTranslationEnabledOnResource: boolean;
};

export function useEditorTranslationOverlay({
	viewRef,
	lastCompletionRef,
	onChange,
	resourceId,
	resourceType,
	enableTranslations = true,
	isTranslationEnabledOnResource,
}: UseTranslationEditorProps) {
	const isTranslationEnabled = useIsTranslationEnabled({
		isTranslationEnabledOnResource,
	});
	const shouldEnableTranslations = isTranslationEnabled && enableTranslations;

	const [translationTriggerPosition, setTranslationTriggerPosition] = useState<{
		top: number;
		left: number;
	} | null>(null);

	const translationCompletionSource = useTranslationCompletionSource({
		resourceId,
		resourceType,
		isTranslationEnabledOnResource,
	});

	const {
		selectedTranslation,
		setSelectedTranslation,
		handleTranslationDelete,
		handleTranslationReplaceKey,
		translationPluginExtension,
	} = useTranslationPluginExtension({
		viewRef,
		lastCompletionRef,
		onChange,
		resourceId,
		resourceType,
		shouldEnableTranslations,
	});

	const handleTranslationPopoverOpenChange = useCallback(
		(open: boolean) => {
			if (!shouldEnableTranslations) return;

			if (!open) {
				setTimeout(() => setSelectedTranslation(null), 0);
				viewRef.current?.focus();
			}
		},
		[viewRef, setSelectedTranslation, shouldEnableTranslations],
	);

	useEffect(() => {
		// Calculate translation popover position when translation is selected
		if (shouldEnableTranslations && selectedTranslation && viewRef.current) {
			const coords = viewRef.current.coordsAtPos(selectedTranslation.from);

			if (coords) {
				const topOffset = TRANSLATION_PILL_HEIGHT + 4; // Small offset below the pill
				setTranslationTriggerPosition({
					top: coords.top + topOffset,
					left: coords.left,
				});
			}
		} else {
			setTranslationTriggerPosition(null);
		}
	}, [selectedTranslation, shouldEnableTranslations, viewRef]);

	const isTranslationPopoverOpen =
		shouldEnableTranslations && !!selectedTranslation;

	return {
		translationCompletionSource,
		translationPluginExtension,
		selectedTranslation,
		setSelectedTranslation,
		handleTranslationDelete,
		handleTranslationReplaceKey,
		handleTranslationPopoverOpenChange,
		translationTriggerPosition,
		isTranslationPopoverOpen,
		shouldEnableTranslations,
	};
}
