/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/identity-providers/component/ClientIdSecret.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { useTranslation } from "react-i18next";
import { PasswordControl, TextControl } from "../../../shared/keycloak-ui-shared";

export const ClientIdSecret = ({
    secretRequired = true,
    create = true
}: {
    secretRequired?: boolean;
    create?: boolean;
}) => {
    const { t } = useTranslation();

    return (
        <>
            <TextControl
                name="config.clientId"
                label={t("clientId")}
                labelIcon={t("clientIdHelp")}
                rules={{
                    required: t("required")
                }}
            />
            <PasswordControl
                name="config.clientSecret"
                label={t("clientSecret")}
                labelIcon={t("clientSecretHelp")}
                hasReveal={create}
                rules={{ required: { value: secretRequired, message: t("required") } }}
            />
        </>
    );
};
