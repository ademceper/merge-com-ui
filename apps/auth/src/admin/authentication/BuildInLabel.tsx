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

import { Label } from "@merge/ui/components/label";
import { CheckCircle } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";

export const BuildInLabel = () => {
    const { t } = useTranslation();

    return (
        <Label className="inline-flex items-center gap-1">
            <CheckCircle className="size-4" />
            {t("buildIn")}
        </Label>
    );
};
