/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/clients/authorization/policy/Regex.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { useTranslation } from "react-i18next";
import { SwitchControl, TextControl } from "../../../../shared/keycloak-ui-shared";

export const Regex = () => {
    const { t } = useTranslation();

    return (
        <>
            <TextControl
                name="targetClaim"
                label={t("targetClaim")}
                labelIcon={t("targetClaimHelp")}
                rules={{ required: t("required") }}
            />
            <TextControl
                name="pattern"
                label={t("regexPattern")}
                labelIcon={t("regexPatternHelp")}
                rules={{ required: t("required") }}
            />
            <SwitchControl
                name="targetContextAttributes"
                label={t("targetContextAttributes")}
                labelIcon={t("targetContextAttributesHelp")}
                labelOn={t("yes")}
                labelOff={t("no")}
            />
        </>
    );
};
