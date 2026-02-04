import type ClientRepresentation from "@keycloak/keycloak-admin-client/lib/defs/clientRepresentation";
import { HelpItem, SelectControl } from "../../../shared/keycloak-ui-shared";
import { Checkbox } from "@merge/ui/components/checkbox";
import { Switch } from "@merge/ui/components/switch";
import { Label } from "@merge/ui/components/label";
import { Controller, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { DefaultSwitchControl } from "../../components/SwitchControl";
import { FormAccess } from "../../components/form/FormAccess";
import { convertAttributeNameToForm } from "../../util";
import useIsFeatureEnabled, { Feature } from "../../utils/useIsFeatureEnabled";
import { FormFields } from "../ClientDetails";
import { IdentityProviderSelect } from "../../components/identity-provider/IdentityProviderSelect";
import { IdentityProviderType } from "@keycloak/keycloak-admin-client/lib/defs/identityProviderRepresentation";
import { useAccess } from "../../context/access/Access";

type CapabilityConfigProps = {
    unWrap?: boolean;
    protocol?: string;
};

export const CapabilityConfig = ({ unWrap, protocol: type }: CapabilityConfigProps) => {
    const { t } = useTranslation();
    const { control, watch, setValue } = useFormContext<FormFields>();
    const protocol = type || watch("protocol");
    const clientAuthentication = watch("publicClient");
    const authorization = watch("authorizationServicesEnabled");
    const jwtAuthorizationGrantEnabled = watch(
        convertAttributeNameToForm<FormFields>(
            "attributes.oauth2.jwt.authorization.grant.enabled"
        ),
        false
    );
    const isFeatureEnabled = useIsFeatureEnabled();
    const { hasSomeAccess } = useAccess();
    const showIdentityProviders = hasSomeAccess("view-identity-providers");
    return (
        <FormAccess
            role="manage-clients"
            unWrap={unWrap}
            className="keycloak__capability-config__form"
            data-testid="capability-config-form"
        >
            {protocol === "openid-connect" && (
                <div className="flex flex-col gap-5">
                    <div className="flex w-full items-center justify-between gap-2">
                        <Label htmlFor="kc-authentication">{t("clientAuthentication")}</Label>
                        <div className="flex shrink-0 items-center gap-2">
                            <Controller
                                name="publicClient"
                                defaultValue={false}
                                control={control}
                                render={({ field }) => {
                                    const checked = !field.value;
                                    return (
                                        <>
                                            <span className="text-sm text-muted-foreground">
                                                {checked ? t("on") : t("off")}
                                            </span>
                                            <Switch
                                                data-testid="authentication"
                                                id="kc-authentication"
                                                checked={checked}
                                                onCheckedChange={(value) => {
                                                    field.onChange(!value);
                                                    if (!value) {
                                                        setValue(
                                                            "authorizationServicesEnabled",
                                                            false
                                                        );
                                                        setValue("serviceAccountsEnabled", false);
                                                        setValue(
                                                            convertAttributeNameToForm<FormFields>(
                                                                "attributes.oidc.ciba.grant.enabled"
                                                            ),
                                                            false
                                                        );
                                                        setValue(
                                                            convertAttributeNameToForm<FormFields>(
                                                                "attributes.standard.token.exchange.enabled"
                                                            ),
                                                            false
                                                        );
                                                        setValue(
                                                            convertAttributeNameToForm<FormFields>(
                                                                "attributes.oauth2.jwt.authorization.grant.enabled"
                                                            ),
                                                            false
                                                        );
                                                    }
                                                }}
                                                aria-label={t("clientAuthentication")}
                                            />
                                        </>
                                    );
                                }}
                            />
                            <HelpItem
                                helpText={t("authenticationHelp")}
                                fieldLabelId="authentication"
                            />
                        </div>
                    </div>
                    <div className="flex w-full items-center justify-between gap-2">
                        <Label htmlFor="kc-authorization">{t("clientAuthorization")}</Label>
                        <div className="flex shrink-0 items-center gap-2">
                            <Controller
                                name="authorizationServicesEnabled"
                                defaultValue={false}
                                control={control}
                                render={({ field }) => {
                                    const checked = field.value && !clientAuthentication;
                                    return (
                                        <>
                                            <span className="text-sm text-muted-foreground">
                                                {checked ? t("on") : t("off")}
                                            </span>
                                            <Switch
                                                data-testid="authorization"
                                                id="kc-authorization-switch"
                                                checked={checked}
                                                onCheckedChange={(value) => {
                                                    field.onChange(value);
                                                    if (value) {
                                                        setValue("serviceAccountsEnabled", true);
                                                    }
                                                }}
                                                disabled={clientAuthentication}
                                                aria-label={t("clientAuthorization")}
                                            />
                                        </>
                                    );
                                }}
                            />
                            <HelpItem
                                helpText={t("authorizationHelp")}
                                fieldLabelId="authorization"
                            />
                        </div>
                    </div>
                    <div id="authenticationFlowGrid" className="grid grid-cols-2 gap-4">
                            <div>
                                <Controller
                                    name="standardFlowEnabled"
                                    defaultValue={true}
                                    control={control}
                                    render={({ field }) => (
                                        <div className="flex w-full items-center justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                                <Checkbox
                                                    data-testid="standard"
                                                    id="kc-flow-standard"
                                                    checked={
                                                        field.value?.toString() === "true"
                                                    }
                                                    onCheckedChange={field.onChange}
                                                />
                                                <Label htmlFor="kc-flow-standard">{t("standardFlow")}</Label>
                                            </div>
                                            <HelpItem
                                                helpText={t("standardFlowHelp")}
                                                fieldLabelId="standardFlow"
                                            />
                                        </div>
                                    )}
                                />
                            </div>
                            <div>
                                <Controller
                                    name="directAccessGrantsEnabled"
                                    defaultValue={false}
                                    control={control}
                                    render={({ field }) => (
                                        <div className="flex w-full items-center justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                                <Checkbox
                                                    data-testid="direct"
                                                    id="kc-flow-direct"
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                                <Label htmlFor="kc-flow-direct">{t("directAccess")}</Label>
                                            </div>
                                            <HelpItem
                                                helpText={t("directAccessHelp")}
                                                fieldLabelId="directAccess"
                                            />
                                        </div>
                                    )}
                                />
                            </div>
                            <div>
                                <Controller
                                    name="implicitFlowEnabled"
                                    defaultValue={true}
                                    control={control}
                                    render={({ field }) => (
                                        <div className="flex w-full items-center justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                                <Checkbox
                                                    data-testid="implicit"
                                                    id="kc-flow-implicit"
                                                    checked={
                                                        field.value?.toString() === "true"
                                                    }
                                                    onCheckedChange={field.onChange}
                                                />
                                                <Label htmlFor="kc-flow-implicit">{t("implicitFlow")}</Label>
                                            </div>
                                            <HelpItem
                                                helpText={t("implicitFlowHelp")}
                                                fieldLabelId="implicitFlow"
                                            />
                                        </div>
                                    )}
                                />
                            </div>
                            <div>
                                <Controller
                                    name="serviceAccountsEnabled"
                                    defaultValue={false}
                                    control={control}
                                    render={({ field }) => (
                                        <div className="flex w-full items-center justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                                <Checkbox
                                                    data-testid="service-account"
                                                    id="kc-flow-service-account"
                                                    checked={
                                                        field.value?.toString() ===
                                                            "true" ||
                                                        (clientAuthentication &&
                                                            authorization)
                                                    }
                                                    onCheckedChange={field.onChange}
                                                    disabled={
                                                        (clientAuthentication &&
                                                            !authorization) ||
                                                        (!clientAuthentication &&
                                                            authorization)
                                                    }
                                                />
                                                <Label htmlFor="kc-flow-service-account">{t("serviceAccount")}</Label>
                                            </div>
                                            <HelpItem
                                                helpText={t("serviceAccountHelp")}
                                                fieldLabelId="serviceAccount"
                                            />
                                        </div>
                                    )}
                                />
                            </div>
                            {isFeatureEnabled(Feature.StandardTokenExchangeV2) && (
                                <div>
                                    <Controller
                                        name={convertAttributeNameToForm<
                                            Required<ClientRepresentation["attributes"]>
                                        >("attributes.standard.token.exchange.enabled")}
                                        defaultValue={false}
                                        control={control}
                                        render={({ field }) => (
                                            <div className="flex w-full items-center justify-between gap-2">
                                                <div className="flex items-center gap-2">
                                                    <Checkbox
                                                        data-testid="standard-token-exchange-enabled"
                                                        id="kc-standard-token-exchange-enabled"
                                                        checked={
                                                            field.value.toString() ===
                                                                "true" &&
                                                            !clientAuthentication
                                                        }
                                                        onCheckedChange={field.onChange}
                                                        disabled={clientAuthentication}
                                                    />
                                                    <Label htmlFor="kc-standard-token-exchange-enabled">{t("standardTokenExchangeEnabled")}</Label>
                                                </div>
                                                <HelpItem
                                                    helpText={t(
                                                        "standardTokenExchangeEnabledHelp"
                                                    )}
                                                    fieldLabelId="standardTokenExchangeEnabled"
                                                />
                                            </div>
                                        )}
                                    />
                                </div>
                            )}
                            {isFeatureEnabled(Feature.JWTAuthorizationGrant) && (
                                <div>
                                    <Controller
                                        name={convertAttributeNameToForm<
                                            Required<ClientRepresentation["attributes"]>
                                        >(
                                            "attributes.oauth2.jwt.authorization.grant.enabled"
                                        )}
                                        defaultValue={false}
                                        control={control}
                                        render={({ field }) => (
                                            <div className="flex w-full items-center justify-between gap-2">
                                                <div className="flex items-center gap-2">
                                                    <Checkbox
                                                        data-testid="jwt-authorization-grant-enabled"
                                                        id="kc-jwt-authorization-grant-enabled"
                                                        checked={
                                                            field.value.toString() ===
                                                                "true" &&
                                                            !clientAuthentication
                                                        }
                                                        onCheckedChange={field.onChange}
                                                        disabled={clientAuthentication}
                                                    />
                                                    <Label htmlFor="kc-jwt-authorization-grant-enabled">{t("jwtAuthorizationGrantEnabled")}</Label>
                                                </div>
                                                <HelpItem
                                                    helpText={t(
                                                        "jwtAuthorizationGrantEnabledHelp"
                                                    )}
                                                    fieldLabelId="jwtAuthorizationGrantEnabled"
                                                />
                                            </div>
                                        )}
                                    />
                                </div>
                            )}
                            {isFeatureEnabled(Feature.DeviceFlow) && (
                                <div>
                                    <Controller
                                        name={convertAttributeNameToForm<
                                            Required<ClientRepresentation["attributes"]>
                                        >(
                                            "attributes.oauth2.device.authorization.grant.enabled"
                                        )}
                                        defaultValue={false}
                                        control={control}
                                        render={({ field }) => (
                                            <div className="flex w-full items-center justify-between gap-2">
                                                <div className="flex items-center gap-2">
                                                    <Checkbox
                                                        data-testid="oauth-device-authorization-grant"
                                                        id="kc-oauth-device-authorization-grant"
                                                        checked={
                                                            field.value.toString() ===
                                                            "true"
                                                        }
                                                        onCheckedChange={field.onChange}
                                                    />
                                                    <Label htmlFor="kc-oauth-device-authorization-grant">{t("oauthDeviceAuthorizationGrant")}</Label>
                                                </div>
                                                <HelpItem
                                                    helpText={t(
                                                        "oauthDeviceAuthorizationGrantHelp"
                                                    )}
                                                    fieldLabelId="oauthDeviceAuthorizationGrant"
                                                />
                                            </div>
                                        )}
                                    />
                                </div>
                            )}
                            <div>
                                <Controller
                                    name={convertAttributeNameToForm<FormFields>(
                                        "attributes.oidc.ciba.grant.enabled"
                                    )}
                                    defaultValue={false}
                                    control={control}
                                    render={({ field }) => (
                                        <div className="flex w-full items-center justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                                <Checkbox
                                                    data-testid="oidc-ciba-grant"
                                                    id="kc-oidc-ciba-grant"
                                                    checked={
                                                        field.value.toString() === "true"
                                                    }
                                                    onCheckedChange={field.onChange}
                                                    disabled={clientAuthentication}
                                                />
                                                <Label htmlFor="kc-oidc-ciba-grant">{t("oidcCibaGrant")}</Label>
                                            </div>
                                            <HelpItem
                                                helpText={t("oidcCibaGrantHelp")}
                                                fieldLabelId="oidcCibaGrant"
                                            />
                                        </div>
                                    )}
                                />
                            </div>
                        </div>
                    <SelectControl
                        id="keyForCodeExchange"
                        label={t("keyForCodeExchange")}
                        labelIcon={t("keyForCodeExchangeHelp")}
                        controller={{ defaultValue: "" }}
                        name={convertAttributeNameToForm<FormFields>(
                            "attributes.pkce.code.challenge.method"
                        )}
                        options={[
                            { key: "", value: t("choose") },
                            { key: "S256", value: "S256" },
                            { key: "plain", value: "plain" }
                        ]}
                        triggerClassName="py-1 dark:border-transparent"
                        triggerStyle={{ height: "3rem", minHeight: "3rem" }}
                    />
                    {isFeatureEnabled(Feature.JWTAuthorizationGrant) &&
                        showIdentityProviders &&
                        jwtAuthorizationGrantEnabled.toString() === "true" && (
                            <IdentityProviderSelect
                                name={convertAttributeNameToForm<FormFields>(
                                    "attributes.oauth2.jwt.authorization.grant.idp"
                                )}
                                label={t("jwtAuthorizationGrantIdp")}
                                helpText={t("jwtAuthorizationGrantIdpHelp")}
                                convertToName={convertAttributeNameToForm}
                                identityProviderType={
                                    IdentityProviderType.JWT_AUTHORIZATION_GRANT
                                }
                                isDisabled={clientAuthentication}
                                realmOnly
                                stringify
                            />
                        )}
                    {isFeatureEnabled(Feature.DPoP) && (
                        <DefaultSwitchControl
                            name={convertAttributeNameToForm<FormFields>(
                                "attributes.dpop.bound.access.tokens"
                            )}
                            label={t("oAuthDPoP")}
                            labelIcon={t("oAuthDPoPHelp")}
                            stringify
                        />
                    )}
                </div>
            )}
            {protocol === "saml" && (
                <div className="flex flex-col gap-5">
                    <DefaultSwitchControl
                        name={convertAttributeNameToForm<FormFields>(
                            "attributes.saml.encrypt"
                        )}
                        label={t("encryptAssertions")}
                        labelIcon={t("encryptAssertionsHelp")}
                    />
                    <DefaultSwitchControl
                        name={convertAttributeNameToForm<FormFields>(
                            "attributes.saml.client.signature"
                        )}
                        label={t("clientSignature")}
                        labelIcon={t("clientSignatureHelp")}
                    />
                </div>
            )}
        </FormAccess>
    );
};
