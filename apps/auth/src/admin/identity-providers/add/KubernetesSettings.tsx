/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/identity-providers/add/KubernetesSettings.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { TextControl } from "../../../shared/keycloak-ui-shared";
import { useTranslation } from "react-i18next";

export const KubernetesSettings = () => {
    const { t } = useTranslation();

    return (
        <>
            <TextControl
                name="alias"
                label={t("alias")}
                labelIcon={t("aliasHelp")}
                rules={{
                    required: t("required")
                }}
            />

            <TextControl
                name="config.issuer"
                labelIcon={t("kubernetesIssuerUrlHelp")}
                label={t("kubernetesIssuerUrl")}
            />
        </>
    );
};
