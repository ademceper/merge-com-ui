/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/identity-providers/component/TextField.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { Input } from "@merge/ui/components/input";
import { useFormContext } from "react-hook-form";

import { FieldProps, FormGroupField } from "./FormGroupField";

export const TextField = ({ label, field, isReadOnly = false }: FieldProps) => {
    const { register } = useFormContext();
    return (
        <FormGroupField label={label}>
            <Input
                id={label}
                data-testid={label}
                readOnly={isReadOnly}
                {...register(field)}
            />
        </FormGroupField>
    );
};
