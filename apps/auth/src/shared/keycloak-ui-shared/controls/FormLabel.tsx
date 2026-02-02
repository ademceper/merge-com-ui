/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "shared/keycloak-ui-shared/controls/FormLabel.tsx"
 *
 * This file is provided by @keycloakify/keycloak-ui-shared version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { Field, FieldContent, FieldError, FieldLabel } from "@merge/ui/components/field";
import { PropsWithChildren, ReactNode } from "react";
import { FieldError as RHFError, FieldValues, Merge } from "react-hook-form";
import { FormErrorText } from "./FormErrorText";
import { HelpItem } from "./HelpItem";

export type FieldProps<T extends FieldValues = FieldValues> = {
    id?: string | undefined;
    label?: string;
    name: string;
    labelIcon?: string | ReactNode;
    error?: RHFError | Merge<RHFError, T>;
    isRequired?: boolean;
    hasNoPaddingTop?: boolean;
};

type FormLabelProps = FieldProps & Omit<React.ComponentProps<"div">, "children">;

export const FormLabel = ({
    id,
    name,
    label,
    labelIcon,
    error,
    children,
    isRequired,
    hasNoPaddingTop,
    ...rest
}: PropsWithChildren<FormLabelProps>) => (
    <Field className={hasNoPaddingTop ? "w-full pt-0" : "w-full"} {...rest}>
        <FieldLabel htmlFor={id || name} className="flex items-center gap-1.5">
            {label || name}
            {isRequired && <span className="text-destructive">*</span>}
            {labelIcon && (
                <HelpItem helpText={labelIcon} fieldLabelId={id || name} />
            )}
        </FieldLabel>
        <FieldContent>
            {children}
            {error?.message && (
                <FormErrorText data-testid={`${name}-helper`} message={error.message} />
            )}
        </FieldContent>
    </Field>
);
