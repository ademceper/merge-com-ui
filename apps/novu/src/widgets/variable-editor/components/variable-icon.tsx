import { TRANSLATION_NAMESPACE_SEPARATOR } from "@/shared";
import { WarningCircle } from "@phosphor-icons/react";
import { Code2 } from "@/shared/ui/icons/code-2";
import { DigestVariableIcon } from "@/shared/ui/icons/digest-variable-icon";
import { RepeatVariable } from "@/shared/ui/icons/repeat-variable";
import { TranslateVariableIcon } from "@/shared/ui/icons/translate-variable";
import { REPEAT_BLOCK_ITERABLE_ALIAS } from "@/widgets/maily-editor/repeat-block-aliases";
import { DIGEST_PREVIEW_MAP } from "@/widgets/variable-editor/utils/digest-variables";

export const VariableIcon = ({
	variableName,
	hasError,
	isNotInSchema,
	context = "variables",
}: {
	variableName: string;
	hasError?: boolean;
	isNotInSchema?: boolean;
	context?: "variables" | "translations";
}) => {
	if (hasError) {
		return <WarningCircle className="text-error-base size-3.5 min-w-3.5" />;
	}

	if (isNotInSchema) {
		return <WarningCircle className="text-error-base size-3.5 min-w-3.5" />;
	}

	if (
		context === "translations" ||
		variableName === TRANSLATION_NAMESPACE_SEPARATOR
	) {
		return (
			<TranslateVariableIcon className="text-feature size-3.5 min-w-3.5" />
		);
	}

	if (variableName && variableName in DIGEST_PREVIEW_MAP) {
		return <DigestVariableIcon className="text-feature size-3.5 min-w-3.5" />;
	}

	if (variableName?.startsWith(REPEAT_BLOCK_ITERABLE_ALIAS)) {
		return <RepeatVariable className="text-feature size-3.5 min-w-3.5" />;
	}

	return <Code2 className="text-feature size-3.5 min-w-3.5" />;
};
