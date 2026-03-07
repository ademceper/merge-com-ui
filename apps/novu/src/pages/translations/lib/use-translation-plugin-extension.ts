import type { EditorView } from "@uiw/react-codemirror";
import { type MutableRefObject, useMemo } from "react";
import { createTranslationExtension } from "@/shared/ui/primitives/translation-plugin";
import type { CompletionRange } from "@/shared/ui/primitives/variable-editor";
import { useFetchTranslationKeys } from "@/pages/translations/api/use-fetch-translation-keys";
import { useTranslations } from "@/pages/translations/lib/use-translations";
import type { LocalizationResourceEnum } from "@/shared/model/translations";

export const useTranslationPluginExtension = ({
	viewRef,
	lastCompletionRef,
	onChange,
	resourceId,
	resourceType,
	shouldEnableTranslations,
}: {
	viewRef: MutableRefObject<EditorView | null>;
	lastCompletionRef: MutableRefObject<CompletionRange | null>;
	onChange: (value: string) => void;
	resourceId: string;
	resourceType: LocalizationResourceEnum;
	shouldEnableTranslations: boolean;
}) => {
	const {
		selectedTranslation,
		setSelectedTranslation,
		handleTranslationDelete,
		handleTranslationReplaceKey,
		handleTranslationSelect,
	} = useTranslations(viewRef, onChange);

	// Translation keys for autocompletion - only fetch if translations are enabled
	const { translationKeys, isLoading: isTranslationKeysLoading } =
		useFetchTranslationKeys({
			resourceId,
			resourceType,
			enabled: shouldEnableTranslations && !!resourceId,
		});

	const translationPluginExtension = useMemo(() => {
		if (!shouldEnableTranslations) return null;

		return createTranslationExtension({
			viewRef,
			lastCompletionRef,
			onSelect: handleTranslationSelect,
			translationKeys,
			isTranslationKeysLoading,
		});
	}, [
		handleTranslationSelect,
		translationKeys,
		isTranslationKeysLoading,
		shouldEnableTranslations,
		viewRef,
		lastCompletionRef,
	]);

	return {
		translationPluginExtension,
		selectedTranslation,
		setSelectedTranslation,
		handleTranslationDelete,
		handleTranslationReplaceKey,
	};
};
