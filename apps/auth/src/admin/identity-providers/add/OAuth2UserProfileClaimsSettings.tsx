/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/identity-providers/add/OAuth2UserProfileClaimsSettings.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { useTranslation } from "react-i18next";
import { TextControl } from "../../../shared/keycloak-ui-shared";
// Form and Title replaced with HTML equivalents

export const UserProfileClaimsSettings = () => {
    const { t } = useTranslation();

    return (
        <form className="py-4">
            <h2 className="text-xl font-semibold mb-4">
                {t("userProfileClaims")}
            </h2>
            <TextControl
                name="config.userIDClaim"
                label={t("userIDClaim")}
                labelIcon={t("userIDClaimHelp")}
                rules={{
                    required: t("required")
                }}
                defaultValue={"sub"}
            />
            <TextControl
                name="config.userNameClaim"
                label={t("userNameClaim")}
                labelIcon={t("userNameClaimHelp")}
                rules={{
                    required: t("required")
                }}
                defaultValue={"preferred_username"}
            />
            <TextControl
                name="config.emailClaim"
                label={t("emailClaim")}
                labelIcon={t("emailClaimHelp")}
                rules={{
                    required: t("required")
                }}
                defaultValue={"email"}
            />
            <TextControl
                name="config.fullNameClaim"
                label={t("fullNameClaim")}
                labelIcon={t("fullNameClaimHelp")}
                defaultValue={"name"}
            />
            <TextControl
                name="config.givenNameClaim"
                label={t("givenNameClaim")}
                labelIcon={t("givenNameClaimHelp")}
                defaultValue={"given_name"}
            />
            <TextControl
                name="config.familyNameClaim"
                label={t("familyNameClaim")}
                labelIcon={t("familyNameClaimHelp")}
                defaultValue={"family_name"}
            />
        </form>
    );
};
