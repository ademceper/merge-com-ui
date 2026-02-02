/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/authentication/BuildInLabel.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { Label } from "../../shared/@patternfly/react-core";
import { CheckCircleIcon } from "../../shared/@patternfly/react-icons";
import { useTranslation } from "react-i18next";

export const BuildInLabel = () => {
    const { t } = useTranslation();

    return (
        <Label icon={<CheckCircleIcon />}>{t("buildIn")}</Label>
    );
};
