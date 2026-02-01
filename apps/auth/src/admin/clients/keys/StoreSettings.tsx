/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/clients/keys/StoreSettings.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { useTranslation } from "react-i18next";
import { PasswordControl, TextControl } from "../../../shared/keycloak-ui-shared";

export const StoreSettings = ({
    hidePassword = false,
    isSaml = false
}: {
    hidePassword?: boolean;
    isSaml?: boolean;
}) => {
    const { t } = useTranslation();

    return (
        <>
            <TextControl
                name="keyAlias"
                label={t("keyAlias")}
                labelIcon={t("keyAliasHelp")}
                rules={{
                    required: t("required")
                }}
            />
            {!hidePassword && (
                <PasswordControl
                    name="keyPassword"
                    label={t("keyPassword")}
                    labelIcon={t("keyPasswordHelp")}
                    rules={{
                        required: t("required")
                    }}
                />
            )}
            {isSaml && (
                <TextControl
                    name="realmAlias"
                    label={t("realmCertificateAlias")}
                    labelIcon={t("realmCertificateAliasHelp")}
                />
            )}
            <PasswordControl
                name="storePassword"
                label={t("storePassword")}
                labelIcon={t("storePasswordHelp")}
                rules={{
                    required: t("required")
                }}
            />
        </>
    );
};
