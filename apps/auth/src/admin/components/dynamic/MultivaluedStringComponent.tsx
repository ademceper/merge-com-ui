/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/components/dynamic/MultivaluedStringComponent.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

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
    convertToName
}: ComponentProps) => {
    const { t } = useTranslation();
    const fieldName = convertToName(name!);

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-1">
                <Label htmlFor={name!}>{t(label!)}{required && " *"}</Label>
                <HelpItem helpText={t(helpText!)} fieldLabelId={`${label}`} />
            </div>
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
        </div>
    );
};
