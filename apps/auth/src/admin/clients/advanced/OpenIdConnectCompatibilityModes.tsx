import { Button } from "@merge/ui/components/button";
import { Switch } from "@merge/ui/components/switch";
import { Label } from "@merge/ui/components/label";
import { Controller, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { FormAccess } from "../../components/form/FormAccess";
import { HelpItem, SelectControl } from "../../../shared/keycloak-ui-shared";
import { convertAttributeNameToForm } from "../../util";
import { FormFields } from "../ClientDetails";
import useIsFeatureEnabled, { Feature } from "../../utils/useIsFeatureEnabled";

type OpenIdConnectCompatibilityModesProps = {
    save: () => void;
    reset: () => void;
    hasConfigureAccess?: boolean;
};

export const OpenIdConnectCompatibilityModes = ({
    save,
    reset,
    hasConfigureAccess
}: OpenIdConnectCompatibilityModesProps) => {
    const { t } = useTranslation();
    const { control, watch } = useFormContext();
    const isFeatureEnabled = useIsFeatureEnabled();
    const tokenExchangeEnabled = watch(
        convertAttributeNameToForm<FormFields>(
            "attributes.standard.token.exchange.enabled"
        )
    );
    const useRefreshTokens = watch(
        convertAttributeNameToForm<FormFields>("attributes.use.refresh.tokens"),
        "true"
    );
    return (
        <FormAccess
            role="manage-clients"
            fineGrainedAccess={hasConfigureAccess}
            isHorizontal
        >
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <Label>{t("excludeSessionStateFromAuthenticationResponse")}</Label>
                    <HelpItem
                        helpText={t("excludeSessionStateFromAuthenticationResponseHelp")}
                        fieldLabelId="excludeSessionStateFromAuthenticationResponse"
                    />
                </div>
                <Controller
                    name={convertAttributeNameToForm<FormFields>(
                        "attributes.exclude.session.state.from.auth.response"
                    )}
                    defaultValue=""
                    control={control}
                    render={({ field }) => (
                        <Switch
                            id="excludeSessionStateFromAuthenticationResponse-switch"
                            checked={field.value === "true"}
                            onCheckedChange={(value) => field.onChange(value.toString())}
                            aria-label={t(
                                "excludeSessionStateFromAuthenticationResponse"
                            )}
                        />
                    )}
                />
            </div>
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <Label>{t("excludeIssuerFromAuthenticationResponse")}</Label>
                    <HelpItem
                        helpText={t("excludeIssuerFromAuthenticationResponseHelp")}
                        fieldLabelId="excludeIssuerFromAuthenticationResponse"
                    />
                </div>
                <Controller
                    name={convertAttributeNameToForm<FormFields>(
                        "attributes.exclude.issuer.from.auth.response"
                    )}
                    defaultValue=""
                    control={control}
                    render={({ field }) => (
                        <Switch
                            id="excludeIssuerFromAuthenticationResponse-switch"
                            checked={field.value === "true"}
                            onCheckedChange={(value) => field.onChange(value.toString())}
                            aria-label={t("excludeIssuerFromAuthenticationResponse")}
                        />
                    )}
                />
            </div>
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <Label>{t("useRefreshTokens")}</Label>
                    <HelpItem
                        helpText={t("useRefreshTokensHelp")}
                        fieldLabelId="useRefreshTokens"
                    />
                </div>
                <Controller
                    name={convertAttributeNameToForm<FormFields>(
                        "attributes.use.refresh.tokens"
                    )}
                    defaultValue="true"
                    control={control}
                    render={({ field }) => (
                        <Switch
                            id="useRefreshTokens"
                            checked={field.value === "true"}
                            onCheckedChange={(value) => field.onChange(value.toString())}
                            aria-label={t("useRefreshTokens")}
                        />
                    )}
                />
            </div>
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <Label>{t("useRefreshTokenForClientCredentialsGrant")}</Label>
                    <HelpItem
                        helpText={t("useRefreshTokenForClientCredentialsGrantHelp")}
                        fieldLabelId="useRefreshTokenForClientCredentialsGrant"
                    />
                </div>
                <Controller
                    name={convertAttributeNameToForm<FormFields>(
                        "attributes.client_credentials.use_refresh_token"
                    )}
                    defaultValue="false"
                    control={control}
                    render={({ field }) => (
                        <Switch
                            id="useRefreshTokenForClientCredentialsGrant"
                            checked={field.value === "true"}
                            onCheckedChange={(value) => field.onChange(value.toString())}
                            aria-label={t("useRefreshTokenForClientCredentialsGrant")}
                        />
                    )}
                />
            </div>
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <Label>{t("useLowerCaseBearerType")}</Label>
                    <HelpItem
                        helpText={t("useLowerCaseBearerTypeHelp")}
                        fieldLabelId="useLowerCaseBearerType"
                    />
                </div>
                <Controller
                    name={convertAttributeNameToForm<FormFields>(
                        "attributes.token.response.type.bearer.lower-case"
                    )}
                    defaultValue="false"
                    control={control}
                    render={({ field }) => (
                        <Switch
                            id="useLowerCaseBearerType"
                            checked={field.value === "true"}
                            onCheckedChange={(value) => field.onChange(value.toString())}
                            aria-label={t("useLowerCaseBearerType")}
                        />
                    )}
                />
            </div>

            {isFeatureEnabled(Feature.StandardTokenExchangeV2) && (
                <SelectControl
                    name={convertAttributeNameToForm<FormFields>(
                        "attributes.standard.token.exchange.enableRefreshRequestedTokenType"
                    )}
                    label={t("enableRefreshRequestedTokenType")}
                    labelIcon={t("enableRefreshRequestedTokenTypeHelp")}
                    controller={{
                        defaultValue: ""
                    }}
                    isDisabled={
                        tokenExchangeEnabled?.toString() !== "true" ||
                        useRefreshTokens?.toString() !== "true"
                    }
                    options={[
                        { key: "", value: t("choose") },
                        { key: "NO", value: t("no") },
                        { key: "SAME_SESSION", value: t("sameSession") }
                    ]}
                />
            )}
            <div className="flex gap-2">
                <Button
                    variant="secondary"
                    onClick={save}
                    data-testid="OIDCCompatabilitySave"
                >
                    {t("save")}
                </Button>
                <Button
                    variant="link"
                    onClick={reset}
                    data-testid="OIDCCompatabilityRevert"
                >
                    {t("revert")}
                </Button>
            </div>
        </FormAccess>
    );
};
