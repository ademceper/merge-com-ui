/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/components/dynamic/ScriptComponent.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { HelpItem } from "../../../shared/keycloak-ui-shared";
import { Label } from "@merge/ui/components/label";
import { Controller, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import CodeEditor from "../form/CodeEditor";
import type { ComponentProps } from "./components";

export const ScriptComponent = ({
    name,
    label,
    helpText,
    defaultValue,
    required,
    isDisabled = false,
    convertToName
}: ComponentProps) => {
    const { t } = useTranslation();
    const { control } = useFormContext();

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-1">
                <Label htmlFor={name!}>{t(label!)}{required && " *"}</Label>
                <HelpItem
                    helpText={<span style={{ whiteSpace: "pre-wrap" }}>{helpText}</span>}
                    fieldLabelId={`${label}`}
                />
            </div>
            <Controller
                name={convertToName(name!)}
                defaultValue={defaultValue}
                control={control}
                render={({ field }) => (
                    <CodeEditor
                        id={name!}
                        data-testid={name}
                        readOnly={isDisabled}
                        onChange={field.onChange}
                        value={Array.isArray(field.value) ? field.value[0] : field.value}
                        language="js"
                        height={600}
                    />
                )}
            />
        </div>
    );
};
