/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/identity-providers/component/FormGroupField.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { Label } from "@merge/ui/components/label";
import { PropsWithChildren } from "react";
import { useTranslation } from "react-i18next";

import { HelpItem } from "../../../shared/keycloak-ui-shared";

export type FieldProps = { label: string; field: string; isReadOnly?: boolean };
export type FormGroupFieldProps = { label: string };

export const FormGroupField = ({
    label,
    children
}: PropsWithChildren<FormGroupFieldProps>) => {
    const { t } = useTranslation();
    return (
        <div className="space-y-2">
            <div className="flex items-center gap-1">
                <Label htmlFor={label}>{t(label)}</Label>
                <HelpItem helpText={t(`${label}Help`)} fieldLabelId={label} />
            </div>
            {children}
        </div>
    );
};
