/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "shared/keycloak-ui-shared/controls/TextControl.tsx"
 *
 * This file is provided by @keycloakify/keycloak-ui-shared version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { Input } from "@merge/ui/components/input";
import { ReactNode } from "react";
import {
    FieldPath,
    FieldValues,
    PathValue,
    UseControllerProps,
    useController
} from "react-hook-form";
import { getRuleValue } from "../utils/getRuleValue";
import { FormLabel } from "./FormLabel";

export type TextControlProps<
    T extends FieldValues,
    P extends FieldPath<T> = FieldPath<T>
> = UseControllerProps<T, P> &
    Omit<React.ComponentProps<typeof Input>, "name" | "required"> & {
        label: string;
        labelIcon?: string | ReactNode;
        isDisabled?: boolean;
        helperText?: string;
        "data-testid"?: string;
        type?: string;
    };

export const TextControl = <T extends FieldValues, P extends FieldPath<T> = FieldPath<T>>(
    props: TextControlProps<T, P>
) => {
    const { labelIcon, helperText, ...rest } = props;
    const required = !!getRuleValue(props.rules?.required);
    const defaultValue = props.defaultValue ?? ("" as PathValue<T, P>);

    const { field, fieldState } = useController({
        ...props,
        defaultValue
    });

    return (
        <FormLabel
            name={props.name}
            label={props.label}
            labelIcon={labelIcon}
            isRequired={required}
            error={fieldState.error}
        >
            <Input
                required={required}
                id={props.name}
                data-testid={props["data-testid"] || props.name}
                aria-invalid={!!fieldState.error}
                disabled={props.isDisabled}
                {...rest}
                {...field}
            />
            {helperText && (
                <p className="text-muted-foreground text-xs mt-1.5">{helperText}</p>
            )}
        </FormLabel>
    );
};
