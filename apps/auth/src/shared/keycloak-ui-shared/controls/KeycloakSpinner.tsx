/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "shared/keycloak-ui-shared/controls/KeycloakSpinner.tsx"
 *
 * This file is provided by @keycloakify/keycloak-ui-shared version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { Spinner } from "@merge/ui/components/spinner";
import { useTranslation } from "react-i18next";

export const KeycloakSpinner = () => {
    const { t } = useTranslation();

    return (
        <div className="flex min-h-[200px] items-center justify-center" aria-label={t("spinnerLoading")}>
            <Spinner className="size-8" />
        </div>
    );
};
