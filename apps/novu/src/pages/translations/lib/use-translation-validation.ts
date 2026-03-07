import { useMemo } from "react";
import type { TranslationKey } from "@/shared/model/translations";
import {
	validateTranslationKey,
	type TranslationValidationResult,
} from "@/shared/lib/translation-validation";

;
;

interface UseTranslationValidationParams {
	translationKey: string;
	availableKeys: TranslationKey[];
	isLoading?: boolean;
	allowEmpty?: boolean;
}

export const useTranslationValidation = ({
	translationKey,
	availableKeys,
	isLoading = false,
	allowEmpty = false,
}: UseTranslationValidationParams): TranslationValidationResult => {
	return useMemo((): TranslationValidationResult => {
		const trimmedKey = translationKey.trim();

		// Don't show error while loading
		if (isLoading) {
			return { hasError: false, errorMessage: "", isValidKey: false };
		}

		// Handle empty key
		if (!trimmedKey) {
			return {
				hasError: !allowEmpty,
				errorMessage: allowEmpty ? "" : "Translation key is required",
				isValidKey: false,
			};
		}

		if (!availableKeys || availableKeys.length === 0) {
			return {
				hasError: true,
				errorMessage: "Translation key not found in default language.",
				isValidKey: false,
			};
		}

		const existingKeys = availableKeys.map((key) => key.name);
		const isValidKey = existingKeys.includes(trimmedKey);

		return {
			hasError: !isValidKey,
			errorMessage: isValidKey
				? ""
				: "Translation key not found in default language.",
			isValidKey,
		};
	}, [translationKey, availableKeys, isLoading, allowEmpty]);
};
