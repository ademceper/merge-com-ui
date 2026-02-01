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

import { Bullseye, Spinner } from "../../@patternfly/react-core";
import { useTranslation } from "react-i18next";

export const KeycloakSpinner = () => {
    const { t } = useTranslation();

    return (
        <Bullseye>
            <Spinner aria-label={t("spinnerLoading")} />
        </Bullseye>
    );
};
