import { useMemo } from "react";
import { showErrorToast } from "@/components/primitives/sonner-helpers";
import { createTranslationAutocompleteSource } from "@/components/primitives/translation-plugin/autocomplete";
import { useCreateTranslationKey } from "@/features/translations/hooks/use-create-translation-key";
import { useFetchTranslationKeys } from "@/features/translations/hooks/use-fetch-translation-keys";
import { useIsTranslationEnabled } from "@/features/translations/hooks/use-is-translation-enabled";
import type { LocalizationResourceEnum } from "@/types/translations";

export const useTranslationCompletionSource = ({
	resourceId,
	resourceType,
	isTranslationEnabledOnResource,
}: {
	resourceId: string;
	resourceType: LocalizationResourceEnum;
	isTranslationEnabledOnResource: boolean;
}) => {
	const isTranslationEnabled = useIsTranslationEnabled({
		isTranslationEnabledOnResource,
	});
	const createTranslationKeyMutation = useCreateTranslationKey();
	const { translationKeys } = useFetchTranslationKeys({
		resourceId,
		resourceType,
		enabled: isTranslationEnabled && !!resourceId,
	});

	const translationCompletionSource = useMemo(() => {
		if (!isTranslationEnabled) return [];

		return [
			createTranslationAutocompleteSource({
				translationKeys,
				onCreateNewTranslationKey: async (translationKey: string) => {
					if (!resourceId) return;

					try {
						await createTranslationKeyMutation.mutateAsync({
							resourceId,
							resourceType,
							translationKey,
							defaultValue: `[${translationKey}]`,
						});
					} catch {
						showErrorToast("Failed to create translation key");
					}
				},
			}),
		];
	}, [
		translationKeys,
		createTranslationKeyMutation,
		resourceId,
		resourceType,
		isTranslationEnabled,
	]);

	return translationCompletionSource;
};
