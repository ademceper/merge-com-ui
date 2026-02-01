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

import { FormGroup } from "../../../shared/@patternfly/react-core";
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
        <FormGroup
            label={t(label)}
            fieldId={label}
            labelIcon={<HelpItem helpText={t(`${label}Help`)} fieldLabelId={label} />}
        >
            {children}
        </FormGroup>
    );
};
