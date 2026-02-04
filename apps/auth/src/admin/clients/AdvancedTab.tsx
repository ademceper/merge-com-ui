import type ClientRepresentation from "@keycloak/keycloak-admin-client/lib/defs/clientRepresentation";
import type GlobalRequestResult from "@keycloak/keycloak-admin-client/lib/defs/globalRequestResult";
import type { TFunction } from "i18next";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { ScrollForm } from "../../shared/keycloak-ui-shared";
import { toast } from "@merge/ui/components/sonner";
import { convertAttributeNameToForm, toUpperCase } from "../util";
import useIsFeatureEnabled, { Feature } from "../utils/useIsFeatureEnabled";
import type { FormFields, SaveOptions } from "./ClientDetails";
import { AdvancedSettings } from "./advanced/AdvancedSettings";
import { AuthenticationOverrides } from "./advanced/AuthenticationOverrides";
import { ClusteringPanel } from "./advanced/ClusteringPanel";
import { FineGrainOpenIdConnect } from "./advanced/FineGrainOpenIdConnect";
import { FineGrainSamlEndpointConfig } from "./advanced/FineGrainSamlEndpointConfig";
import { OpenIdConnectCompatibilityModes } from "./advanced/OpenIdConnectCompatibilityModes";
import { OpenIdVerifiableCredentials } from "./advanced/OpenIdVerifiableCredentials";
import { PROTOCOL_OIDC, PROTOCOL_OID4VC } from "./constants";

export const parseResult = (
    result: GlobalRequestResult,
    prefixKey: string,
    t: TFunction
) => {
    const successCount = result.successRequests?.length || 0;
    const failedCount = result.failedRequests?.length || 0;

    if (successCount === 0 && failedCount === 0) {
        toast.warning(t("noAdminUrlSet"));
    } else if (failedCount > 0) {
        toast.success(t(prefixKey + "Success", { successNodes: result.successRequests }));
        toast.error(t(prefixKey + "Fail", { failedNodes: result.failedRequests }));
    } else {
        toast.success(t(prefixKey + "Success", { successNodes: result.successRequests }));
    }
};

export type AdvancedProps = {
    save: (options?: SaveOptions) => void;
    client: ClientRepresentation;
};

export const AdvancedTab = ({ save, client }: AdvancedProps) => {
    const { t } = useTranslation();
    const isFeatureEnabled = useIsFeatureEnabled();

    const { setValue } = useFormContext();
    const { publicClient, attributes, protocol, authenticationFlowBindingOverrides } =
        client;

    const resetFields = (names: string[]) => {
        for (const name of names) {
            setValue(
                convertAttributeNameToForm<FormFields>(`attributes.${name}`),
                attributes?.[name] || ""
            );
        }
    };

    return (
        <div className="bg-muted/30 py-0">
            <ScrollForm
                label={t("jumpToSection")}
                sections={[
                    {
                        title: t("clustering"),
                        isHidden: !publicClient,
                        panel: <ClusteringPanel client={client} save={save} />
                    },
                    {
                        title: t("fineGrainOpenIdConnectConfiguration"),
                        isHidden: protocol !== PROTOCOL_OIDC,
                        panel: (
                            <>
                                <p className="pb-6">
                                    {t("fineGrainOpenIdConnectConfigurationHelp")}
                                </p>
                                <FineGrainOpenIdConnect
                                    save={save}
                                    reset={() => {
                                        resetFields([
                                            "logoUri",
                                            "policyUri",
                                            "tosUri",
                                            "access.token.signed.response.alg",
                                            "access.token.header.type.rfc9068",
                                            "id.token.signed.response.alg",
                                            "id.token.encrypted.response.alg",
                                            "id.token.encrypted.response.enc",
                                            "id.token.as.detached.signature",
                                            "user.info.response.signature.alg",
                                            "user.info.encrypted.response.alg",
                                            "user.info.encrypted.response.enc",
                                            "request.object.signature.alg",
                                            "request.object.encryption.alg",
                                            "request.object.encryption.enc",
                                            "request.object.required",
                                            "request.uris",
                                            "authorization.signed.response.alg",
                                            "authorization.encrypted.response.alg",
                                            "authorization.encrypted.response.enc"
                                        ]);
                                    }}
                                />
                            </>
                        )
                    },
                    {
                        title: t("openIdConnectCompatibilityModes"),
                        isHidden: protocol !== PROTOCOL_OIDC,
                        panel: (
                            <>
                                <p className="pb-6">
                                    {t("openIdConnectCompatibilityModesHelp")}
                                </p>
                                <OpenIdConnectCompatibilityModes
                                    save={() => save()}
                                    reset={() =>
                                        resetFields([
                                            "exclude.session.state.from.auth.response",
                                            "use.refresh.tokens",
                                            "client_credentials.use_refresh_token",
                                            "token.response.type.bearer.lower-case"
                                        ])
                                    }
                                />
                            </>
                        )
                    },
                    {
                        title: t("fineGrainSamlEndpointConfig"),
                        isHidden: protocol === PROTOCOL_OIDC,
                        panel: (
                            <>
                                <p className="pb-6">
                                    {t("fineGrainSamlEndpointConfigHelp")}
                                </p>
                                <FineGrainSamlEndpointConfig
                                    save={() => save()}
                                    reset={() =>
                                        resetFields([
                                            "logoUri",
                                            "policyUri",
                                            "tosUri",
                                            "saml_assertion_consumer_url_post",
                                            "saml_assertion_consumer_url_redirect",
                                            "saml_single_logout_service_url_post",
                                            "saml_single_logout_service_url_redirect",
                                            "saml_single_logout_service_url_artifact",
                                            "saml_artifact_binding_url",
                                            "saml_artifact_resolution_service_url"
                                        ])
                                    }
                                />
                            </>
                        )
                    },
                    {
                        title: t("advancedSettings"),
                        panel: (
                            <>
                                <p className="pb-6">
                                    {t("advancedSettings" + toUpperCase(protocol || ""))}
                                </p>
                                <AdvancedSettings
                                    protocol={protocol}
                                    save={() => save()}
                                    reset={() => {
                                        resetFields([
                                            "saml.assertion.lifespan",
                                            "access.token.lifespan",
                                            "session.idle.timeout",
                                            "client.session.max.lifespan",
                                            "client.offline.session.idle.timeout",
                                            "client.offline.session.max.lifespan",
                                            "dpop.bound.access.tokens",
                                            "tls.client.certificate.bound.access.tokens",
                                            "require.pushed.authorization.requests",
                                            "client.use.lightweight.access.token.enabled",
                                            "client.introspection.response.allow.jwt.claim.enabled",
                                            "pkce.code.challenge.method",
                                            "acr.loa.map",
                                            "default.acr.values",
                                            "minimum.acr.value"
                                        ]);
                                    }}
                                />
                            </>
                        )
                    },
                    {
                        title: t("openIdVerifiableCredentials"),
                        isHidden:
                            (protocol !== PROTOCOL_OIDC &&
                                protocol !== PROTOCOL_OID4VC) ||
                            !isFeatureEnabled(Feature.OpenId4VCI),
                        panel: (
                            <>
                                <p className="pb-6">
                                    {t("openIdVerifiableCredentialsHelp")}
                                </p>
                                <OpenIdVerifiableCredentials
                                    client={client}
                                    save={save}
                                    reset={() => resetFields(["oid4vci.enabled"])}
                                />
                            </>
                        )
                    },
                    {
                        title: t("authenticationOverrides"),
                        panel: (
                            <>
                                <p className="pb-6">
                                    {t("authenticationOverridesHelp")}
                                </p>
                                <AuthenticationOverrides
                                    protocol={protocol}
                                    save={() => save()}
                                    reset={() => {
                                        setValue(
                                            "authenticationFlowBindingOverrides.browser",
                                            authenticationFlowBindingOverrides?.browser
                                        );
                                        setValue(
                                            "authenticationFlowBindingOverrides.direct_grant",
                                            authenticationFlowBindingOverrides?.direct_grant
                                        );
                                    }}
                                />
                            </>
                        )
                    }
                ]}
                borders
            />
        </div>
    );
};
