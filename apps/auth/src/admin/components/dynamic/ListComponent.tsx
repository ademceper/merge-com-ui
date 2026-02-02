/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/components/dynamic/ListComponent.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import {
    HelpItem,
    KeycloakSelect,
    SelectVariant
} from "../../../shared/keycloak-ui-shared";
import { Label } from "@merge/ui/components/label";
import { SelectOption } from "../../../shared/@patternfly/react-core";
import { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import type { ComponentProps } from "./components";

export const ListComponent = ({
    name,
    label,
    helpText,
    defaultValue,
    options,
    required,
    isDisabled = false,
    convertToName
}: ComponentProps) => {
    const { t } = useTranslation();
    const { control } = useFormContext();
    const [open, setOpen] = useState(false);

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-1">
                <Label htmlFor={name!}>{t(label!)}{required && " *"}</Label>
                <HelpItem helpText={t(helpText!)} fieldLabelId={`${label}`} />
            </div>
            <Controller
                name={convertToName(name!)}
                data-testid={name}
                defaultValue={defaultValue || options?.[0] || ""}
                control={control}
                render={({ field }) => (
                    <KeycloakSelect
                        toggleId={name}
                        isDisabled={isDisabled}
                        onToggle={toggle => setOpen(toggle)}
                        onSelect={value => {
                            field.onChange(value as string);
                            setOpen(false);
                        }}
                        selections={field.value}
                        variant={SelectVariant.single}
                        aria-label={t(label!)}
                        isOpen={open}
                    >
                        {options?.map(option => (
                            <SelectOption
                                selected={option === field.value}
                                key={option}
                                value={option}
                            >
                                {option}
                            </SelectOption>
                        ))}
                    </KeycloakSelect>
                )}
            />
        </div>
    );
};
