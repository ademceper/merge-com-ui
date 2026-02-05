import type ClientScopeRepresentation from "@keycloak/keycloak-admin-client/lib/defs/clientScopeRepresentation";
import type { KeyMetadataRepresentation } from "@keycloak/keycloak-admin-client/lib/defs/keyMetadataRepresentation";
import { Button } from "@merge/ui/components/button";
import { NumberInput } from "@merge/ui/components/number-input";
import { useEffect, useMemo, useState } from "react";
import { Controller, FormProvider, useForm, useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
    FormLabel,
    SelectControl,
    TextAreaControl,
    TextControl,
    useFetch
} from "../../../shared/keycloak-ui-shared";

import { useAdminClient } from "../../admin-client";
import { getProtocolName } from "../../clients/utils";
import { DefaultSwitchControl } from "../../components/SwitchControl";
import {
    ClientScopeDefaultOptionalType,
    allClientScopeTypes
} from "../../components/client-scope/ClientScopeTypes";
import { FormAccess } from "../../components/form/FormAccess";
import { useRealm } from "../../context/realm-context/RealmContext";
import {
    useLoginProviders,
    useServerInfo
} from "../../context/server-info/ServerInfoProvider";
import { convertAttributeNameToForm, convertToFormValues } from "../../util";
import useIsFeatureEnabled, { Feature } from "../../utils/useIsFeatureEnabled";
import { toClientScopes } from "../routes/ClientScopes";

const OID4VC_PROTOCOL = "oid4vc";
const VC_FORMAT_JWT_VC = "jwt_vc";
const VC_FORMAT_SD_JWT = "dc+sd-jwt";

// Validation function for comma-separated lists
const validateCommaSeparatedList = (value: string | undefined) => {
    if (!value || value.trim() === "") {
        return true;
    }
    if (value.includes(", ") || value.includes(" ,")) {
        return "Comma-separated list must not contain spaces around commas";
    }
    const entries = value.split(",");
    const hasEmptyEntries = entries.some(entry => entry.trim() === "");
    if (hasEmptyEntries) {
        return "Comma-separated list contains empty entries";
    }
    return true;
};

const GUI_ORDER_FIELD = convertAttributeNameToForm<ClientScopeDefaultOptionalType>(
    "attributes.gui.order"
);

function GuiOrderField() {
    const { t } = useTranslation();
    const { control } = useFormContext<ClientScopeDefaultOptionalType>();
    return (
        <Controller
            name={GUI_ORDER_FIELD}
            control={control}
            render={({ field, fieldState }) => {
                const value = field.value === undefined || field.value === ""
                    ? ""
                    : Number(field.value);
                return (
                    <FormLabel
                        name={GUI_ORDER_FIELD}
                        label={t("guiOrder")}
                        labelIcon={t("guiOrderHelp")}
                        error={fieldState.error}
                    >
                        <NumberInput
                            id={GUI_ORDER_FIELD}
                            value={value}
                            onChange={(v) => field.onChange(v === "" ? undefined : v)}
                            onBlur={field.onBlur}
                            ref={field.ref}
                            min={0}
                            aria-invalid={!!fieldState.error}
                        />
                    </FormLabel>
                );
            }}
        />
    );
}

type ScopeFormProps = {
    clientScope?: ClientScopeRepresentation;
    save: (clientScope: ClientScopeDefaultOptionalType) => void;
    /** Dialog içinde kullanıldığında form dışarıdan submit edilebilir */
    formId?: string;
    /** true ise Save/Cancel butonları gösterilmez (dialog footer kullanılır) */
    embedded?: boolean;
};

export const ScopeForm = ({ clientScope, save, formId, embedded }: ScopeFormProps) => {
    const { t } = useTranslation();
    const { adminClient } = useAdminClient();
    const form = useForm<ClientScopeDefaultOptionalType>({ mode: "onChange" });
    const { control, handleSubmit, setValue, formState } = form;
    const { isDirty, isValid } = formState;
    const { realm } = useRealm();

    const providers = useLoginProviders();
    const serverInfo = useServerInfo();
    const isFeatureEnabled = useIsFeatureEnabled();
    const isDynamicScopesEnabled = isFeatureEnabled(Feature.DynamicScopes);

    // Get available signature algorithms from server info
    const signatureAlgorithms = useMemo(
        () =>
            serverInfo?.providers?.signature?.providers
                ? Object.keys(serverInfo.providers.signature.providers)
                : [],
        [serverInfo]
    );

    // Fetch realm keys for signing_key_id dropdown
    const [realmKeys, setRealmKeys] = useState<KeyMetadataRepresentation[]>([]);

    useFetch(
        async () => {
            const keysMetadata = await adminClient.realms.getKeys({ realm });
            return keysMetadata.keys || [];
        },
        setRealmKeys,
        []
    );

    // Prepare key options for SelectControl
    // Filter only active keys suitable for signing credentials
    const keyOptions = useMemo(() => {
        const options = [{ key: "", value: t("useDefaultKey") }];
        if (realmKeys && realmKeys.length > 0) {
            const keyOptions = realmKeys
                .filter(
                    key =>
                        key.kid &&
                        key.status === "ACTIVE" &&
                        key.algorithm &&
                        signatureAlgorithms.includes(key.algorithm)
                )
                .map(key => ({
                    key: key.kid!,
                    value: `${key.kid} (${key.algorithm})`
                }));
            options.push(...keyOptions);
        }
        return options;
    }, [realmKeys, signatureAlgorithms, t]);

    const displayOnConsentScreen: string = useWatch({
        control,
        name: convertAttributeNameToForm("attributes.display.on.consent.screen"),
        defaultValue: clientScope?.attributes?.["display.on.consent.screen"] ?? "true"
    });

    const dynamicScope = useWatch({
        control,
        name: convertAttributeNameToForm<ClientScopeDefaultOptionalType>(
            "attributes.is.dynamic.scope"
        ),
        defaultValue: "false"
    });

    const selectedProtocol = useWatch({
        control,
        name: "protocol"
    });

    const selectedFormat = useWatch({
        control,
        name: convertAttributeNameToForm<ClientScopeDefaultOptionalType>(
            "attributes.vc.format"
        ),
        defaultValue: clientScope?.attributes?.["vc.format"] ?? VC_FORMAT_SD_JWT
    });

    const isOid4vcProtocol = selectedProtocol === OID4VC_PROTOCOL;
    const isOid4vcEnabled = isFeatureEnabled(Feature.OpenId4VCI);
    const isNotSaml = selectedProtocol != "saml";

    const setDynamicRegex = (value: string, append: boolean) =>
        setValue(
            convertAttributeNameToForm<ClientScopeDefaultOptionalType>(
                "attributes.dynamic.scope.regexp"
            ),
            append ? `${value}:*` : value,
            { shouldDirty: true } // Mark the field as dirty when we modify the field
        );

    useEffect(() => {
        convertToFormValues(clientScope ?? {}, setValue);
    }, [clientScope, setValue]);

    return (
        <FormAccess
            role="manage-clients"
            onSubmit={handleSubmit(save)}
            isHorizontal={!embedded}
            id={formId}
        >
            <FormProvider {...form}>
                <div className={embedded ? "flex flex-col gap-5" : ""}>
                <TextControl
                    name="name"
                    label={t("name")}
                    labelIcon={t("scopeNameHelp")}
                    rules={{
                        required: t("required"),
                        onChange: e => {
                            if (isDynamicScopesEnabled)
                                setDynamicRegex(e.target.validated, true);
                        }
                    }}
                />
                {isDynamicScopesEnabled && (
                    <>
                        <DefaultSwitchControl
                            name={convertAttributeNameToForm<ClientScopeDefaultOptionalType>(
                                "attributes.is.dynamic.scope"
                            )}
                            label={t("dynamicScope")}
                            labelIcon={t("dynamicScopeHelp")}
                            onValueChange={(value: boolean) => {
                                setDynamicRegex(
                                    value ? form.getValues("name") || "" : "",
                                    value
                                );
                            }}
                            stringify
                        />
                        {dynamicScope === "true" && (
                            <TextControl
                                name={convertAttributeNameToForm<ClientScopeDefaultOptionalType>(
                                    "attributes.dynamic.scope.regexp"
                                )}
                                label={t("dynamicScopeFormat")}
                                labelIcon={t("dynamicScopeFormatHelp")}
                                isDisabled
                            />
                        )}
                    </>
                )}
                <TextAreaControl
                    name="description"
                    label={t("description")}
                    labelIcon={t("scopeDescriptionHelp")}
                    rules={{
                        maxLength: {
                            value: 255,
                            message: t("maxLength")
                        }
                    }}
                />
                <SelectControl
                    id="kc-type"
                    name="type"
                    label={t("type")}
                    labelIcon={t("scopeTypeHelp")}
                    controller={{ defaultValue: allClientScopeTypes[0] }}
                    options={allClientScopeTypes.map(key => ({
                        key,
                        value: t(`clientScopeType.${key}`)
                    }))}
                />
                {!clientScope && (
                    <SelectControl
                        id="kc-protocol"
                        name="protocol"
                        label={t("protocol")}
                        labelIcon={t("protocolHelp")}
                        controller={{ defaultValue: providers[0] }}
                        options={providers
                            .filter(option =>
                                option === OID4VC_PROTOCOL ? isOid4vcEnabled : true
                            )
                            .map(option => ({
                                key: option,
                                value: getProtocolName(t, option)
                            }))}
                    />
                )}
                <DefaultSwitchControl
                    name={convertAttributeNameToForm<ClientScopeDefaultOptionalType>(
                        "attributes.display.on.consent.screen"
                    )}
                    defaultValue={displayOnConsentScreen}
                    label={t("displayOnConsentScreen")}
                    labelIcon={t("displayOnConsentScreenHelp")}
                    stringify
                />
                {displayOnConsentScreen === "true" && (
                    <TextAreaControl
                        name={convertAttributeNameToForm<ClientScopeDefaultOptionalType>(
                            "attributes.consent.screen.text"
                        )}
                        label={t("consentScreenText")}
                        labelIcon={t("consentScreenTextHelp")}
                    />
                )}
                <DefaultSwitchControl
                    name={convertAttributeNameToForm<ClientScopeDefaultOptionalType>(
                        "attributes.include.in.token.scope"
                    )}
                    label={t("includeInTokenScope")}
                    labelIcon={t("includeInTokenScopeHelp")}
                    stringify
                />
                {isNotSaml && (
                    <DefaultSwitchControl
                        name={convertAttributeNameToForm<ClientScopeDefaultOptionalType>(
                            "attributes.include.in.openid.provider.metadata"
                        )}
                        defaultValue="true"
                        label={t("includeInOpenIdProviderMetadata")}
                        labelIcon={t("includeInOpenIdProviderMetadataHelp")}
                        stringify
                    />
                )}
                <GuiOrderField />

                {isOid4vcProtocol && isOid4vcEnabled && (
                    <>
                        <TextControl
                            name={convertAttributeNameToForm<ClientScopeDefaultOptionalType>(
                                "attributes.vc.credential_configuration_id"
                            )}
                            label={t("credentialConfigurationId")}
                            labelIcon={t("credentialConfigurationIdHelp")}
                        />
                        <TextControl
                            name={convertAttributeNameToForm<ClientScopeDefaultOptionalType>(
                                "attributes.vc.credential_identifier"
                            )}
                            label={t("credentialIdentifier")}
                            labelIcon={t("credentialIdentifierHelp")}
                        />
                        <TextControl
                            name={convertAttributeNameToForm<ClientScopeDefaultOptionalType>(
                                "attributes.vc.issuer_did"
                            )}
                            label={t("issuerDid")}
                            labelIcon={t("issuerDidHelp")}
                        />
                        <TextControl
                            name={convertAttributeNameToForm<ClientScopeDefaultOptionalType>(
                                "attributes.vc.expiry_in_seconds"
                            )}
                            label={t("credentialLifetime")}
                            labelIcon={t("credentialLifetimeHelp")}
                            type="number"
                            min={1}
                        />
                        <SelectControl
                            id="kc-vc-format"
                            name={convertAttributeNameToForm<ClientScopeDefaultOptionalType>(
                                "attributes.vc.format"
                            )}
                            label={t("supportedFormats")}
                            labelIcon={t("supportedFormatsHelp")}
                            controller={{ defaultValue: VC_FORMAT_SD_JWT }}
                            options={[
                                {
                                    key: VC_FORMAT_SD_JWT,
                                    value: `SD-JWT VC (${VC_FORMAT_SD_JWT})`
                                },
                                {
                                    key: VC_FORMAT_JWT_VC,
                                    value: `JWT VC (${VC_FORMAT_JWT_VC})`
                                }
                            ]}
                        />
                        <TextControl
                            name={convertAttributeNameToForm<ClientScopeDefaultOptionalType>(
                                "attributes.vc.credential_build_config.token_jws_type"
                            )}
                            label={t("tokenJwsType")}
                            labelIcon={t("tokenJwsTypeHelp")}
                            defaultValue={
                                clientScope?.attributes?.[
                                    "vc.credential_build_config.token_jws_type"
                                ] ?? "JWS"
                            }
                        />
                        {realmKeys && realmKeys.length > 0 && (
                            <SelectControl
                                id="kc-signing-key-id"
                                name={convertAttributeNameToForm<ClientScopeDefaultOptionalType>(
                                    "attributes.vc.signing_key_id"
                                )}
                                label={t("signingKeyId")}
                                labelIcon={t("signingKeyIdHelp")}
                                controller={{
                                    defaultValue:
                                        clientScope?.attributes?.["vc.signing_key_id"] ??
                                        ""
                                }}
                                options={keyOptions}
                            />
                        )}
                        <TextAreaControl
                            name={convertAttributeNameToForm<ClientScopeDefaultOptionalType>(
                                "attributes.vc.display"
                            )}
                            label={t("credentialDisplay")}
                            labelIcon={t("credentialDisplayHelp")}
                            rules={{
                                validate: (value: string | undefined) => {
                                    if (!value || value.trim() === "") {
                                        return true;
                                    }
                                    try {
                                        JSON.parse(value);
                                        return true;
                                    } catch {
                                        return "Invalid JSON format";
                                    }
                                }
                            }}
                        />
                        {(selectedFormat === VC_FORMAT_JWT_VC ||
                            selectedFormat === VC_FORMAT_SD_JWT) && (
                            <TextControl
                                name={convertAttributeNameToForm<ClientScopeDefaultOptionalType>(
                                    "attributes.vc.supported_credential_types"
                                )}
                                label={t("supportedCredentialTypes")}
                                labelIcon={t("supportedCredentialTypesHelp")}
                                rules={{
                                    validate: validateCommaSeparatedList
                                }}
                            />
                        )}
                        {selectedFormat === VC_FORMAT_SD_JWT && (
                            <>
                                <TextControl
                                    name={convertAttributeNameToForm<ClientScopeDefaultOptionalType>(
                                        "attributes.vc.verifiable_credential_type"
                                    )}
                                    label={t("verifiableCredentialType")}
                                    labelIcon={t("verifiableCredentialTypeHelp")}
                                />
                                <TextControl
                                    name={convertAttributeNameToForm<ClientScopeDefaultOptionalType>(
                                        "attributes.vc.credential_build_config.sd_jwt.visible_claims"
                                    )}
                                    label={t("visibleClaims")}
                                    labelIcon={t("visibleClaimsHelp")}
                                    defaultValue={
                                        clientScope?.attributes?.[
                                            "vc.credential_build_config.sd_jwt.visible_claims"
                                        ] ?? "id,iat,nbf,exp,jti"
                                    }
                                    rules={{
                                        validate: validateCommaSeparatedList
                                    }}
                                />
                            </>
                        )}
                    </>
                )}

                {!embedded && (
                    <div className="flex gap-2">
                        <Button
                            type="submit"
                            data-testid="save"
                            disabled={!isDirty || !isValid || formState.isLoading || formState.isValidating || formState.isSubmitting}
                        >
                            {t("save")}
                        </Button>
                        <Button
                            variant="link"
                            asChild
                        >
                            <Link to={toClientScopes({ realm })}>{t("cancel")}</Link>
                        </Button>
                    </div>
                )}
                </div>
            </FormProvider>
        </FormAccess>
    );
};
