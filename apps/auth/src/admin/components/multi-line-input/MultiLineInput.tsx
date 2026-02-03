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
import { cn } from "@merge/ui/lib/utils";
import { MinusCircle, PlusCircle } from "@phosphor-icons/react";
import React, { Fragment, useEffect, useMemo } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { formInputWrapperClassName, HelpItem } from "../../../shared/keycloak-ui-shared";

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
    /** Placeholder for inputs (no label shown). */
    placeholder?: string;
    /** Help icon shown on the right of the first row (with placeholder, no label). */
    labelIcon?: string | React.ReactNode;
};

export const MultiLineInput = ({
    name,
    addButtonLabel,
    isDisabled = false,
    defaultValue,
    stringify = false,
    isRequired = false,
    placeholder,
    labelIcon,
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
        <div id={id} className="flex flex-col gap-3">
            {fields.map((value, index) => (
                <Fragment key={index}>
                    {index === 0 && labelIcon != null ? (
                        <div className="flex min-w-0 items-center gap-2">
                            <div className={cn(formInputWrapperClassName, "min-w-0 flex-1")}>
                                <Input
                                    data-testid={name + index}
                                    onChange={(e) => updateValue(index, e.target.value)}
                                    name={`${name}.${index}.value`}
                                    value={value}
                                    disabled={isDisabled}
                                    placeholder={placeholder}
                                    className={cn(
                                        "h-full flex-1 min-w-0 border-0 rounded-none bg-transparent dark:bg-transparent px-3 py-2 text-foreground placeholder:text-muted-foreground outline-none focus-visible:ring-0",
                                        rest.className
                                    )}
                                    {...rest}
                                />
                                <Button
                                    type="button"
                                    data-testid={"remove" + index}
                                    variant="ghost"
                                    size="icon-sm"
                                    onClick={() => remove(index)}
                                    tabIndex={-1}
                                    aria-label={t("remove")}
                                    disabled={fields.length === 1 || isDisabled}
                                    className="!bg-transparent hover:!bg-transparent shrink-0 rounded-full text-muted-foreground hover:text-foreground mr-2"
                                >
                                    <MinusCircle className="size-4" />
                                </Button>
                            </div>
                            <HelpItem helpText={labelIcon} fieldLabelId={id || name} />
                        </div>
                    ) : (
                        <div className={formInputWrapperClassName}>
                            <Input
                                data-testid={name + index}
                                onChange={(e) => updateValue(index, e.target.value)}
                                name={`${name}.${index}.value`}
                                value={value}
                                disabled={isDisabled}
                                className={cn(
                                    "h-full flex-1 min-w-0 border-0 rounded-none bg-transparent dark:bg-transparent px-3 py-2 text-foreground placeholder:text-muted-foreground outline-none focus-visible:ring-0",
                                    rest.className
                                )}
                                {...rest}
                            />
                            <Button
                                type="button"
                                data-testid={"remove" + index}
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => remove(index)}
                                tabIndex={-1}
                                aria-label={t("remove")}
                                disabled={fields.length === 1 || isDisabled}
                                className="!bg-transparent hover:!bg-transparent shrink-0 rounded-full text-muted-foreground hover:text-foreground mr-2"
                            >
                                <MinusCircle className="size-4" />
                            </Button>
                        </div>
                    )}
                    {index === fields.length - 1 && (
                        <Button
                            variant="link"
                            onClick={append}
                            tabIndex={-1}
                            aria-label={t("add")}
                            data-testid={`${name}-addValue`}
                            disabled={isDisabled}
                            className="px-0 h-auto font-medium"
                        >
                            <PlusCircle className="size-4 mr-1" /> {t(addButtonLabel || "add")}
                        </Button>
                    )}
                </Fragment>
            ))}
        </div>
    );
};
