/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "shared/keycloak-ui-shared/controls/select-control/SingleSelectControl.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@merge/ui/components/select";
import { get } from "lodash-es";
import { useState } from "react";
import { Controller, FieldPath, FieldValues, useFormContext } from "react-hook-form";
import { getRuleValue } from "../../utils/getRuleValue";
import { FormLabel } from "../FormLabel";
import { SelectControlProps, isSelectBasedOptions, isString, key } from "./SelectControl";

export const SingleSelectControl = <
    T extends FieldValues,
    P extends FieldPath<T> = FieldPath<T>
>({
    id,
    name,
    label,
    options,
    selectedOptions = [],
    controller,
    labelIcon,
    isDisabled,
    onSelect,
    placeholderText,
    ...rest
}: SelectControlProps<T, P>) => {
    const {
        control,
        formState: { errors }
    } = useFormContext();
    const [open, setOpen] = useState(false);
    const required = getRuleValue(controller.rules?.required) === true;

    const allOptions = [...(Array.isArray(options) ? options : []), ...(selectedOptions || [])];

    return (
        <FormLabel
            id={id}
            name={name}
            label={label}
            isRequired={required}
            error={get(errors, name)}
            labelIcon={labelIcon}
        >
            <Controller
                {...controller}
                name={name}
                control={control}
                render={({ field: { onChange, value } }) => {
                    const strValue = Array.isArray(value) ? value[0] : value;
                    const displayValue = isSelectBasedOptions(allOptions)
                        ? allOptions.find(o => o.key === strValue)?.value ?? ""
                        : (strValue ?? "");
                    return (
                        <Select
                            {...rest}
                            open={open}
                            onOpenChange={setOpen}
                            value={strValue ?? ""}
                            onValueChange={v => {
                                const convertedValue = Array.isArray(value) ? [v] : v;
                                if (onSelect) {
                                    onSelect(convertedValue, onChange);
                                } else {
                                    onChange(convertedValue);
                                }
                                setOpen(false);
                            }}
                            disabled={isDisabled}
                        >
                            <SelectTrigger
                                id={id || name}
                                aria-label={label}
                                aria-invalid={!!get(errors, name)}
                                className="w-full"
                            >
                                <SelectValue placeholder={placeholderText}>
                                    {displayValue}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent data-testid={`select-${name}`}>
                                {allOptions.map(option => (
                                    <SelectItem key={key(option)} value={key(option)}>
                                        {isString(option) ? option : option.value}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    );
                }}
            />
        </FormLabel>
    );
};
