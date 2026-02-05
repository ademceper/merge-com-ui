import { HelpItem } from "../../../shared/keycloak-ui-shared";
import { Label } from "@merge/ui/components/label";
import { useTranslation } from "react-i18next";
import { MultiLineInput } from "../multi-line-input/MultiLineInput";
import type { ComponentProps } from "./components";

function convertDefaultValue(formValue?: any): string[] {
    return formValue && Array.isArray(formValue) ? formValue : [formValue];
}

export const MultiValuedStringComponent = ({
    name,
    label,
    defaultValue,
    helpText,
    stringify,
    required,
    isDisabled = false,
    convertToName,
    hideLabel = false,
    helpIconAfterControl = false,
}: ComponentProps) => {
    const { t } = useTranslation();
    const fieldName = convertToName(name!);

    return (
        <div className="space-y-2">
            {!hideLabel && (
                <div className="flex items-center gap-1">
                    <Label htmlFor={name!}>{t(label!)}{required && " *"}</Label>
                    {!helpIconAfterControl && (
                        <HelpItem helpText={t(helpText!)} fieldLabelId={`${label}`} />
                    )}
                </div>
            )}
            {helpIconAfterControl ? (
                <MultiLineInput
                    id={name}
                    aria-label={t(label!)}
                    name={fieldName}
                    isDisabled={isDisabled}
                    defaultValue={convertDefaultValue(defaultValue)}
                    addButtonLabel={t("addMultivaluedLabel", {
                        fieldLabel: t(label!).toLowerCase()
                    })}
                    stringify={stringify}
                    labelIcon={helpText ? t(helpText) : undefined}
                />
            ) : (
                <MultiLineInput
                    aria-label={t(label!)}
                    name={fieldName}
                    isDisabled={isDisabled}
                    defaultValue={convertDefaultValue(defaultValue)}
                    addButtonLabel={t("addMultivaluedLabel", {
                        fieldLabel: t(label!).toLowerCase()
                    })}
                    stringify={stringify}
                />
            )}
        </div>
    );
};
