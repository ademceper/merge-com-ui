/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "shared/keycloak-ui-shared/controls/FormErrorText.tsx"
 *
 * This file is provided by @keycloakify/keycloak-ui-shared version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { WarningCircle } from "@phosphor-icons/react";
import { FieldError } from "@merge/ui/components/field";

export type FormErrorTextProps = React.ComponentProps<"div"> & {
    message: string;
};

export const FormErrorText = ({ message, ...props }: FormErrorTextProps) => {
    return (
        <FieldError className="flex items-center gap-1.5 text-destructive text-sm" {...props}>
            <WarningCircle size={16} className="shrink-0" />
            {message}
        </FieldError>
    );
};
