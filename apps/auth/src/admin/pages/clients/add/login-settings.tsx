import { useTranslation } from "@merge-rd/i18n";
import { Label } from "@merge-rd/ui/components/label";
import { useFormContext } from "react-hook-form";
import { HelpItem, TextControl } from "../../../../shared/keycloak-ui-shared";
import { convertAttributeNameToForm } from "../../../shared/lib/util";
import { MultiLineInput } from "../../../shared/ui/multi-line-input/multi-line-input";
import type { FormFields } from "../client-details";

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
                            <Label htmlFor="kc-postLogoutRedirect">
                                {t("validPostLogoutRedirectUri")}
                            </Label>
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
