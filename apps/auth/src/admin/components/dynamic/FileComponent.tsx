/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/components/dynamic/FileComponent.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { HelpItem } from "../../../shared/keycloak-ui-shared";
import { Label } from "@merge/ui/components/label";
import { FileUpload } from "../../../shared/@patternfly/react-core";
import { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import type { ComponentProps } from "./components";

export const FileComponent = ({
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
    const [filename, setFilename] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-1">
                <Label htmlFor={name!}>{t(label!)}{required && " *"}</Label>
                <HelpItem helpText={t(helpText!)} fieldLabelId={`${label}`} />
            </div>
            <Controller
                name={convertToName(name!)}
                control={control}
                defaultValue={defaultValue || ""}
                render={({ field }) => (
                    <FileUpload
                        id={name!}
                        value={field.value}
                        type="text"
                        filename={filename}
                        isDisabled={isDisabled}
                        onFileInputChange={(_, file) => setFilename(file.name)}
                        onReadStarted={() => setIsLoading(true)}
                        onReadFinished={() => setIsLoading(false)}
                        onClearClick={() => {
                            field.onChange("");
                            setFilename("");
                        }}
                        isLoading={isLoading}
                        allowEditingUploadedText={false}
                        onTextChange={value => {
                            field.onChange(value);
                        }}
                        onDataChange={(_, value) => {
                            field.onChange(value);
                        }}
                    />
                )}
            />
        </div>
    );
};
