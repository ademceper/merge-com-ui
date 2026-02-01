/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/clients/advanced/ApplicationUrls.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { useTranslation } from "react-i18next";
import { TextControl } from "../../../shared/keycloak-ui-shared";

type ApplicationUrlsProps = {
    isDisabled?: boolean;
};

export const ApplicationUrls = (props: ApplicationUrlsProps) => {
    const { t } = useTranslation();

    return (
        <>
            <TextControl
                name="attributes.logoUri"
                label={t("logoUrl")}
                labelIcon={t("logoUrlHelp")}
                type="url"
                {...props}
            />
            <TextControl
                name="attributes.policyUri"
                label={t("policyUrl")}
                labelIcon={t("policyUrlHelp")}
                type="url"
                {...props}
            />
            <TextControl
                name="attributes.tosUri"
                label={t("termsOfServiceUrl")}
                labelIcon={t("termsOfServiceUrlHelp")}
                type="url"
                {...props}
            />
        </>
    );
};
