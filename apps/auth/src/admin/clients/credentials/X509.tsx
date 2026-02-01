/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/clients/credentials/X509.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { useTranslation } from "react-i18next";
import { TextControl } from "../../../shared/keycloak-ui-shared";
import { DefaultSwitchControl } from "../../components/SwitchControl";
import { convertAttributeNameToForm } from "../../util";
import { FormFields } from "../ClientDetails";

export const X509 = () => {
    const { t } = useTranslation();
    return (
        <>
            <DefaultSwitchControl
                name={convertAttributeNameToForm<FormFields>(
                    "attributes.x509.allow.regex.pattern.comparison"
                )}
                label={t("allowRegexComparison")}
                labelIcon={t("allowRegexComparisonHelp")}
                stringify
            />
            <TextControl
                name={convertAttributeNameToForm("attributes.x509.subjectdn")}
                label={t("subject")}
                labelIcon={t("subjectHelp")}
                rules={{
                    required: t("required")
                }}
            />
        </>
    );
};
