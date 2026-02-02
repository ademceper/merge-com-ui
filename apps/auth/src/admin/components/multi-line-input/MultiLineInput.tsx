/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/components/multi-line-input/MultiLineInput.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { Button } from "@merge/ui/components/button";
import { Input } from "@merge/ui/components/input";
import { MinusCircle, PlusCircle } from "@phosphor-icons/react";
import React, { Fragment, useEffect, useMemo } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

function stringToMultiline(value?: string): string[] {
    return typeof value === "string" ? value.split("##") : [value || ""];
}

function toStringValue(formValue: string[]): string {
    return formValue.join("##");
}

export type MultiLineInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "form" | "defaultValue"> & {
    name: string;
    addButtonLabel?: string;
    isDisabled?: boolean;
    defaultValue?: string[];
    stringify?: boolean;
    isRequired?: boolean;
};

export const MultiLineInput = ({
    name,
    addButtonLabel,
    isDisabled = false,
    defaultValue,
    stringify = false,
    isRequired = false,
    id,
    ...rest
}: MultiLineInputProps) => {
    const { t } = useTranslation();
    const { register, setValue, control } = useFormContext();
    const value = useWatch({
        name,
        control,
        defaultValue: defaultValue || ""
    });

    const fields = useMemo<string[]>(() => {
        let values = stringify
            ? stringToMultiline(
                  Array.isArray(value) && value.length === 1 ? value[0] : value
              )
            : Array.isArray(value)
              ? value
              : [value];

        if (!Array.isArray(values) || values.length === 0) {
            values = (stringify
                ? stringToMultiline(defaultValue as string)
                : defaultValue) || [""];
        }

        return values;
    }, [value]);

    const remove = (index: number) => {
        update([...fields.slice(0, index), ...fields.slice(index + 1)]);
    };

    const append = () => {
        update([...fields, ""]);
    };

    const updateValue = (index: number, value: string) => {
        update([...fields.slice(0, index), value, ...fields.slice(index + 1)]);
    };

    const update = (values: string[]) => {
        const fieldValue = values.flatMap(field => field);
        setValue(name, stringify ? toStringValue(fieldValue) : fieldValue, {
            shouldDirty: true,
            shouldValidate: true
        });
    };

    useEffect(() => {
        register(name, {
            validate: value =>
                isRequired && toStringValue(value || []).length === 0
                    ? t("required")
                    : undefined
        });
    }, [register]);

    return (
        <div id={id}>
            {fields.map((value, index) => (
                <Fragment key={index}>
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <Input
                                data-testid={name + index}
                                onChange={(e) => updateValue(index, e.target.value)}
                                name={`${name}.${index}.value`}
                                value={value}
                                disabled={isDisabled}
                                {...rest}
                            />
                        </div>
                        <div>
                            <Button
                                data-testid={"remove" + index}
                                variant="link"
                                onClick={() => remove(index)}
                                tabIndex={-1}
                                aria-label={t("remove")}
                                disabled={fields.length === 1 || isDisabled}
                            >
                                <MinusCircle className="size-4" />
                            </Button>
                        </div>
                    </div>
                    {index === fields.length - 1 && (
                        <Button
                            variant="link"
                            onClick={append}
                            tabIndex={-1}
                            aria-label={t("add")}
                            data-testid={`${name}-addValue`}
                            disabled={!value || isDisabled}
                        >
                            <PlusCircle className="size-4 mr-1" /> {t(addButtonLabel || "add")}
                        </Button>
                    )}
                </Fragment>
            ))}
        </div>
    );
};
