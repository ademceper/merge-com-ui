/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/components/dynamic/MultivaluedListComponent.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import {
    FormErrorText,
    HelpItem,
    KeycloakSelect,
    SelectVariant
} from "../../../shared/keycloak-ui-shared";
import { Label } from "@merge/ui/components/label";
import { SelectOption } from "../../../shared/keycloak-ui-shared";
import { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import type { ComponentProps } from "./components";

function stringToMultiline(value?: string): string[] {
    return typeof value === "string" && value.length > 0 ? value.split("##") : [];
}

function toStringValue(formValue: string[]): string {
    return formValue.join("##");
}

type MultiValuedListComponentProps = ComponentProps & {
    variant?: `${SelectVariant}`;
};

export const MultiValuedListComponent = ({
    name,
    label,
    helpText,
    defaultValue,
    options,
    isDisabled = false,
    stringify,
    required,
    convertToName,
    onSearch,
    variant = SelectVariant.typeaheadMulti
}: MultiValuedListComponentProps) => {
    const { t } = useTranslation();
    const {
        control,
        formState: { errors }
    } = useFormContext();
    const [open, setOpen] = useState(false);

    function setSearch(value: string) {
        if (onSearch) {
            onSearch(value);
        }
    }

    const convertedName = convertToName(name!);

    const getError = () => {
        return convertedName
            .split(".")
            .reduce((record: any, key) => record?.[key], errors);
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-1">
                <Label htmlFor={name!}>{t(label!)}{required && " *"}</Label>
                <HelpItem helpText={t(helpText!)} fieldLabelId={`${label}`} />
            </div>
            <Controller
                name={convertedName}
                control={control}
                defaultValue={
                    stringify || variant !== SelectVariant.typeaheadMulti
                        ? defaultValue || ""
                        : defaultValue
                          ? [defaultValue]
                          : []
                }
                rules={{
                    required: { value: required || false, message: t("required") }
                }}
                render={({ field }) => (
                    <>
                        <KeycloakSelect
                            toggleId={name}
                            data-testid={name}
                            isDisabled={isDisabled}
                            chipGroupProps={{
                                numChips: 3,
                                expandedText: t("hide"),
                                collapsedText: t("showRemaining")
                            }}
                            variant={variant}
                            typeAheadAriaLabel={t("choose")}
                            onToggle={setOpen}
                            selections={
                                stringify && variant === SelectVariant.typeaheadMulti
                                    ? stringToMultiline(field.value)
                                    : field.value
                            }
                            onSelect={v => {
                                const option = v.toString();
                                if (variant === SelectVariant.typeaheadMulti) {
                                    const values = stringify
                                        ? stringToMultiline(field.value)
                                        : field.value;
                                    let newValue;
                                    if (values.includes(option)) {
                                        newValue = values.filter(
                                            (item: string) => item !== option
                                        );
                                    } else if (option !== "") {
                                        newValue = [...values, option];
                                    } else {
                                        newValue = values;
                                    }
                                    field.onChange(
                                        stringify &&
                                            variant === SelectVariant.typeaheadMulti
                                            ? toStringValue(newValue)
                                            : newValue
                                    );
                                } else {
                                    field.onChange(option);
                                }
                            }}
                            onClear={() => {
                                field.onChange(
                                    stringify || variant !== SelectVariant.typeaheadMulti
                                        ? ""
                                        : []
                                );
                            }}
                            onFilter={setSearch}
                            isOpen={open}
                        >
                            {options?.map(option => (
                                <SelectOption key={option} value={option}>
                                    {option}
                                </SelectOption>
                            ))}
                        </KeycloakSelect>
                        {getError() && <FormErrorText message={getError().message} />}
                    </>
                )}
            />
        </div>
    );
};
