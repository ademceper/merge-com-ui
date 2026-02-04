/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/clients/add/LoginSettings.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { Label } from "@merge/ui/components/label";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { HelpItem, TextControl } from "../../../shared/keycloak-ui-shared";

import { MultiLineInput } from "../../components/multi-line-input/MultiLineInput";
import { convertAttributeNameToForm } from "../../util";
import { FormFields } from "../ClientDetails";

type LoginSettingsProps = {
    protocol?: string;
};

export const LoginSettings = ({ protocol = "openid-connect" }: LoginSettingsProps) => {
    const { t } = useTranslation();
    const { watch } = useFormContext<FormFields>();

    const standardFlowEnabled = watch("standardFlowEnabled");
    const implicitFlowEnabled = watch("implicitFlowEnabled");

    return (
        <div className="flex flex-col gap-5">
            <TextControl
                type="url"
                name="rootUrl"
                label={t("rootUrl")}
                labelIcon={t("rootURLHelp")}
            />
            <TextControl
                type="url"
                name="baseUrl"
                label={t("homeURL")}
                labelIcon={t("homeURLHelp")}
            />
            {(standardFlowEnabled || implicitFlowEnabled) && (
                <>
                    <div className="flex flex-col gap-2">
                        <div className="flex w-full items-center justify-between gap-2">
                            <Label htmlFor="kc-redirect">{t("validRedirectUri")}</Label>
                            <HelpItem
                                helpText={t("validRedirectURIsHelp")}
                                fieldLabelId="validRedirectUri"
                            />
                        </div>
                        <MultiLineInput
                            id="kc-redirect"
                            name="redirectUris"
                            aria-label={t("validRedirectUri")}
                            addButtonLabel="addRedirectUri"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <div className="flex w-full items-center justify-between gap-2">
                            <Label htmlFor="kc-postLogoutRedirect">{t("validPostLogoutRedirectUri")}</Label>
                            <HelpItem
                                helpText={t("validPostLogoutRedirectURIsHelp")}
                                fieldLabelId="validPostLogoutRedirectUri"
                            />
                        </div>
                        <MultiLineInput
                            id="kc-postLogoutRedirect"
                            name={convertAttributeNameToForm(
                                "attributes.post.logout.redirect.uris"
                            )}
                            aria-label={t("validPostLogoutRedirectUri")}
                            addButtonLabel="addPostLogoutRedirectUri"
                            stringify
                        />
                    </div>
                </>
            )}
            {protocol === "saml" && (
                <>
                    <TextControl
                        name="attributes.saml_idp_initiated_sso_url_name"
                        label={t("idpInitiatedSsoUrlName")}
                        labelIcon={t("idpInitiatedSsoUrlNameHelp")}
                    />
                    <TextControl
                        name="attributes.saml_idp_initiated_sso_relay_state"
                        label={t("idpInitiatedSsoRelayState")}
                        labelIcon={t("idpInitiatedSsoRelayStateHelp")}
                    />
                    <TextControl
                        type="url"
                        name="adminUrl"
                        label={t("masterSamlProcessingUrl")}
                        labelIcon={t("masterSamlProcessingUrlHelp")}
                    />
                </>
            )}
            {protocol !== "saml" && standardFlowEnabled && (
                <div className="flex flex-col gap-2">
                    <div className="flex w-full items-center justify-between gap-2">
                        <Label htmlFor="kc-web-origins">{t("webOrigins")}</Label>
                        <HelpItem
                            helpText={t("webOriginsHelp")}
                            fieldLabelId="webOrigins"
                        />
                    </div>
                    <MultiLineInput
                        id="kc-web-origins"
                        name="webOrigins"
                        aria-label={t("webOrigins")}
                        addButtonLabel="addWebOrigins"
                    />
                </div>
            )}
        </div>
    );
};
