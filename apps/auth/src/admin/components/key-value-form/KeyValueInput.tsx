/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/components/key-value-form/KeyValueInput.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { Button } from "@merge/ui/components/button";
import { Input } from "@merge/ui/components/input";
import { MinusCircle, PlusCircle } from "@phosphor-icons/react";
import { Fragment, FunctionComponent, PropsWithChildren } from "react";
import { FieldValues, useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

export type DefaultValue = {
    key: string;
    values?: string[];
    label: string;
};

type Field = {
    name: string;
};

type ValueField = Field & {
    keyValue: string;
};

type KeyValueInputProps = PropsWithChildren & {
    name: string;
    label?: string;
    isDisabled?: boolean;
    KeyComponent?: FunctionComponent<Field>;
    ValueComponent?: FunctionComponent<ValueField>;
};

export const KeyValueInput = ({
    name,
    label = "attributes",
    isDisabled = false,
    KeyComponent,
    ValueComponent
}: KeyValueInputProps) => {
    const { t } = useTranslation();
    const {
        control,
        register,
        formState: { errors }
    } = useFormContext();

    const { fields, append, remove } = useFieldArray({
        control,
        name
    });

    const appendNew = () => append({ key: "", value: "" });

    const values = useWatch<FieldValues>({
        name,
        control,
        defaultValue: []
    });

    return fields.length > 0 ? (
        <>
            <div className="grid grid-cols-12 gap-4">
                <div className="col-span-5 font-medium">
                    <span>{t("key")}</span>
                </div>
                <div className="col-span-7 font-medium">
                    <span>{t("value")}</span>
                </div>
                {fields.map((attribute, index) => {
                    const error = (errors as any)[name]?.[index];
                    const keyError = !!error?.key;
                    const valueErrorPresent = !!error?.value || !!error?.message;
                    const valueError = error?.message || t("valueError");
                    return (
                        <Fragment key={attribute.id}>
                            <div className="col-span-5">
                                {KeyComponent ? (
                                    <KeyComponent name={`${name}.${index}.key`} />
                                ) : (
                                    <Input
                                        placeholder={t("keyPlaceholder")}
                                        aria-label={t("key")}
                                        data-testid={`${name}-key`}
                                        {...register(`${name}.${index}.key`, {
                                            required: true
                                        })}
                                        className={keyError ? "border-destructive" : ""}
                                        required
                                        disabled={isDisabled}
                                    />
                                )}
                                {keyError && (
                                    <p className="text-sm text-destructive mt-1">
                                        {t("keyError")}
                                    </p>
                                )}
                            </div>
                            <div className="col-span-5">
                                {ValueComponent ? (
                                    <ValueComponent
                                        name={`${name}.${index}.value`}
                                        keyValue={values[index]?.key}
                                    />
                                ) : (
                                    <Input
                                        placeholder={t("valuePlaceholder")}
                                        aria-label={t("value")}
                                        data-testid={`${name}-value`}
                                        {...register(`${name}.${index}.value`, {
                                            required: true
                                        })}
                                        className={valueErrorPresent ? "border-destructive" : ""}
                                        required
                                        disabled={isDisabled}
                                    />
                                )}
                                {valueErrorPresent && (
                                    <p className="text-sm text-destructive mt-1">
                                        {valueError}
                                    </p>
                                )}
                            </div>
                            <div className="col-span-2">
                                <Button
                                    variant="link"
                                    title={t("removeAttribute")}
                                    onClick={() => remove(index)}
                                    data-testid={`${name}-remove`}
                                    disabled={isDisabled}
                                >
                                    <MinusCircle className="size-4" />
                                </Button>
                            </div>
                        </Fragment>
                    );
                })}
            </div>
            <div className="mt-2">
                <Button
                    data-testid={`${name}-add-row`}
                    className="px-0 mt-1"
                    variant="link"
                    onClick={appendNew}
                    disabled={isDisabled}
                >
                    <PlusCircle className="size-4 mr-1" />
                    {t("addAttribute", { label })}
                </Button>
            </div>
        </>
    ) : (
        <div
            data-testid={`${name}-empty-state`}
            className="p-0 text-center"
        >
            <p className="text-muted-foreground">{t("missingAttributes", { label })}</p>
            <div className="mt-2">
                <Button
                    data-testid={`${name}-add-row`}
                    variant="link"
                    size="sm"
                    onClick={appendNew}
                    disabled={isDisabled}
                >
                    <PlusCircle className="size-4 mr-1" />
                    {t("addAttribute", { label })}
                </Button>
            </div>
        </div>
    );
};
