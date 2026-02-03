/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "shared/keycloak-ui-shared/user-profile/MultiInputComponent.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { Button } from "@merge/ui/components/button";
import { Input } from "@merge/ui/components/input";
import { MinusCircle, PlusCircle } from "@phosphor-icons/react";
import { type TFunction } from "i18next";
import { Fragment, useEffect, useMemo } from "react";
import { FieldPath, UseFormReturn, useWatch } from "react-hook-form";

import { InputType, UserProfileFieldProps } from "./UserProfileFields";
import { UserProfileGroup } from "./UserProfileGroup";
import { UserFormFields, fieldName, labelAttribute } from "./utils";

export const MultiInputComponent = ({
    t,
    form,
    attribute,
    renderer,
    ...rest
}: UserProfileFieldProps) => (
    <UserProfileGroup t={t} form={form} attribute={attribute} renderer={renderer}>
        <MultiLineInput
            t={t}
            form={form}
            aria-label={labelAttribute(t, attribute)}
            name={fieldName(attribute.name)!}
            defaultValue={[attribute.defaultValue || ""]}
            addButtonLabel={t("addMultivaluedLabel", {
                fieldLabel: labelAttribute(t, attribute)
            })}
            {...rest}
        />
    </UserProfileGroup>
);

export type MultiLineInputProps = {
    t: TFunction;
    name: FieldPath<UserFormFields>;
    form: UseFormReturn<UserFormFields>;
    addButtonLabel?: string;
    isDisabled?: boolean;
    defaultValue?: string[];
    inputType: InputType;
    id?: string;
    [key: string]: unknown;
};

type HtmlInputType = "text" | "email" | "tel" | "url";

const MultiLineInput = ({
    t,
    name,
    inputType,
    form,
    addButtonLabel,
    isDisabled = false,
    defaultValue,
    id,
    ...rest
}: MultiLineInputProps) => {
    const { register, setValue, control } = form;
    const value = useWatch({
        name,
        control,
        defaultValue: defaultValue || ""
    });

    const fields = useMemo<string[]>(() => {
        return Array.isArray(value) && value.length !== 0 ? value : defaultValue || [""];
    }, [value]);

    const remove = (index: number) => {
        update([...fields.slice(0, index), ...fields.slice(index + 1)]);
    };

    const append = () => {
        update([...fields, ""]);
    };

    const updateValue = (index: number, val: string) => {
        update([...fields.slice(0, index), val, ...fields.slice(index + 1)]);
    };

    const update = (values: string[]) => {
        const fieldValue = values.flatMap(field => field);
        setValue(name, fieldValue, {
            shouldDirty: true
        });
    };

    const type: HtmlInputType = inputType.startsWith("html")
        ? (inputType.substring("html".length + 2) as HtmlInputType)
        : "text";

    useEffect(() => {
        register(name);
    }, [register]);

    return (
        <div id={id} className="flex flex-col gap-2">
            {fields.map((val, index) => (
                <Fragment key={index}>
                    <div className="flex w-full items-center gap-1 rounded-lg border border-input bg-transparent">
                        <Input
                            data-testid={name + index}
                            onChange={e => updateValue(index, e.target.value)}
                            value={val}
                            disabled={isDisabled}
                            type={type}
                            className="flex-1 border-0 shadow-none focus-visible:ring-0"
                            {...rest}
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            data-testid={"remove" + index}
                            onClick={() => remove(index)}
                            tabIndex={-1}
                            aria-label={t("remove")}
                            disabled={fields.length === 1 || isDisabled}
                            className="shrink-0"
                        >
                            <MinusCircle className="size-5" />
                        </Button>
                    </div>
                    {index === fields.length - 1 && (
                        <Button
                            type="button"
                            variant="link"
                            onClick={append}
                            tabIndex={-1}
                            aria-label={t("add")}
                            data-testid="addValue"
                            disabled={!val || isDisabled}
                            className="h-auto p-0"
                        >
                            <PlusCircle className="size-5 mr-1" /> {t(addButtonLabel || "add")}
                        </Button>
                    )}
                </Fragment>
            ))}
        </div>
    );
};
