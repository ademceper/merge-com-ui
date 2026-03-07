import type { TranslationKey } from "@/shared/model/translations";

export interface TranslationValidationResult {
	hasError: boolean;
	errorMessage: string;
	isValidKey: boolean;
}

/**
 * Simple validation function for use in non-React contexts
 * Used by the translation plugin's class-based components
 */
export const validateTranslationKey = (
	translationKey: string,
	availableKeys: TranslationKey[],
	isLoading = false,
): TranslationValidationResult => {
	const trimmedKey = translationKey.trim();

	// Don't show error while loading or empty key
	if (isLoading || !trimmedKey) {
		return { hasError: false, errorMessage: "", isValidKey: false };
	}

	// If no translation keys are provided, show error
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
};
