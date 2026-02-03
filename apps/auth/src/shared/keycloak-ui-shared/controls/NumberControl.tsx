/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "shared/keycloak-ui-shared/controls/NumberControl.tsx"
 *
 * This file is provided by @keycloakify/keycloak-ui-shared version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { Input } from "@merge/ui/components/input";
import { cn } from "@merge/ui/lib/utils";
import {
    Controller,
    ControllerProps,
    FieldPath,
    FieldValues,
    UseControllerProps,
    useFormContext
} from "react-hook-form";

import { getRuleValue } from "../utils/getRuleValue";
import { formInputClassName } from "./form-input-styles";
import { FormLabel } from "./FormLabel";

export type NumberControlOption = {
    key: string;
    value: string;
};

export type NumberControlProps<
    T extends FieldValues,
    P extends FieldPath<T> = FieldPath<T>
> = Omit<React.ComponentProps<typeof Input>, "name" | "required" | "type"> &
    UseControllerProps<T, P> & {
        name: string;
        label?: string;
        labelIcon?: string;
        controller: Omit<ControllerProps, "name" | "render">;
    };

export const NumberControl = <
    T extends FieldValues,
    P extends FieldPath<T> = FieldPath<T>
>({
    name,
    label,
    controller,
    labelIcon,
    ...rest
}: NumberControlProps<T, P>) => {
    const {
        control,
        formState: { errors }
    } = useFormContext();

    return (
        <FormLabel
            name={name}
            label={label}
            isRequired={controller.rules?.required === true}
            error={errors[name]}
            labelIcon={labelIcon}
            showLabel={false}
        >
            <Controller
                {...controller}
                name={name}
                control={control}
                render={({ field }) => {
                    const required = !!controller.rules?.required;
                    const min = getRuleValue(controller.rules?.min);
                    const max = getRuleValue(controller.rules?.max);
                    const value = field.value ?? controller.defaultValue;
                    const setValue = (newValue: number) =>
                        field.onChange(
                            min !== undefined ? Math.max(newValue, Number(min)) : newValue
                        );

                    return (
                        <Input
                            {...rest}
                            type="number"
                            id={name}
                            placeholder={rest.placeholder ?? label}
                            className={cn(formInputClassName, rest.className)}
                            value={value ?? ""}
                            aria-invalid={!!errors[name]}
                            required={required}
                            min={min !== undefined ? Number(min) : undefined}
                            max={max !== undefined ? Number(max) : undefined}
                            onChange={(event) => {
                                const newValue = Number(event.currentTarget.value);
                                setValue(
                                    !Number.isNaN(newValue) ? newValue : (controller.defaultValue ?? 0)
                                );
                            }}
                            onBlur={field.onBlur}
                            ref={field.ref}
                        />
                    );
                }}
            />
        </FormLabel>
    );
};
