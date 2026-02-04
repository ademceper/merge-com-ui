import type RealmRepresentation from "@keycloak/keycloak-admin-client/lib/defs/realmRepresentation";
import { HelpItem,
    KeycloakSelect,
    SelectVariant,
    ScrollForm,
    SelectControl,
    NumberControl } from "../../shared/keycloak-ui-shared";
import { toast } from "@merge/ui/components/sonner";
import { Input } from "@merge/ui/components/input";
import { Textarea } from "@merge/ui/components/textarea";
import { Switch } from "@merge/ui/components/switch";
import { useState } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { FormAccess } from "../components/form/FormAccess";
import { FixedButtonsGroup } from "../components/form/FixedButtonGroup";
import { DefaultSwitchControl } from "../components/SwitchControl";
import { convertAttributeNameToForm } from "../util";
import { TimeSelector, toHumanFormat } from "../components/time-selector/TimeSelector";
import { TimeSelectorControl } from "../components/time-selector/TimeSelectorControl";
import { useServerInfo } from "../context/server-info/ServerInfoProvider";
import { useWhoAmI } from "../context/whoami/WhoAmI";
import { beerify, sortProviders } from "../util";
import useIsFeatureEnabled, { Feature } from "../utils/useIsFeatureEnabled";

type RealmSettingsTokensTabProps = {
    realm: RealmRepresentation;
    save: (realm: RealmRepresentation) => void;
};

export const RealmSettingsTokensTab = ({ realm, save }: RealmSettingsTokensTabProps) => {
    const { t } = useTranslation();
    const serverInfo = useServerInfo();
    const isFeatureEnabled = useIsFeatureEnabled();
    const { whoAmI } = useWhoAmI();

    const [defaultSigAlgDrpdwnIsOpen, setDefaultSigAlgDrpdwnOpen] = useState(false);

    const defaultSigAlgOptions = sortProviders(
        serverInfo.providers!["signature"].providers
    );

    const asymmetricSigAlgOptions =
        serverInfo.cryptoInfo?.clientSignatureAsymmetricAlgorithms ?? [];

    const { control, register, reset, formState, handleSubmit } =
        useFormContext<RealmRepresentation>();

    // Show a global error notification if validation fails
    const onError = () => {
        toast.error(t("oid4vciFormValidationError"));
    };

    const offlineSessionMaxEnabled = useWatch({
        control,
        name: "offlineSessionMaxLifespanEnabled",
        defaultValue: realm.offlineSessionMaxLifespanEnabled
    });

    const ssoSessionIdleTimeout = useWatch({
        control,
        name: "ssoSessionIdleTimeout",
        defaultValue: 36000
    });

    const revokeRefreshToken = useWatch({
        control,
        name: "revokeRefreshToken",
        defaultValue: false
    });

    const signedMetadataEnabled = useWatch({
        control,
        name: convertAttributeNameToForm("attributes.oid4vci.signed_metadata.enabled"),
        defaultValue: realm.attributes?.["oid4vci.signed_metadata.enabled"]
    });

    const encryptionRequired = useWatch({
        control,
        name: convertAttributeNameToForm("attributes.oid4vci.encryption.required"),
        defaultValue: realm.attributes?.["oid4vci.encryption.required"]
    });

    const strategy = useWatch({
        control,
        name: convertAttributeNameToForm("attributes.oid4vci.time.claims.strategy"),
        defaultValue: realm.attributes?.["oid4vci.time.claims.strategy"] ?? "off"
    });

    const sections = [
        {
            title: t("general"),
            panel: (
                <FormAccess
                    isHorizontal
                    role="manage-realm"
                    onSubmit={handleSubmit(save)}
                >
                    <div className="space-y-2">
                        <div className="flex items-center gap-1">
                            <label htmlFor="kc-default-signature-algorithm">{t("defaultSigAlg")}</label>
                            <HelpItem
                                helpText={t("defaultSigAlgHelp")}
                                fieldLabelId="algorithm"
                            />
                        </div>
                        <Controller
                            name="defaultSignatureAlgorithm"
                            defaultValue={"RS256"}
                            control={control}
                            render={({ field }) => (
                                <KeycloakSelect
                                    toggleId="kc-default-sig-alg"
                                    onToggle={() =>
                                        setDefaultSigAlgDrpdwnOpen(
                                            !defaultSigAlgDrpdwnIsOpen
                                        )
                                    }
                                    onSelect={value => {
                                        field.onChange(value.toString());
                                        setDefaultSigAlgDrpdwnOpen(false);
                                    }}
                                    selections={field.value?.toString()}
                                    variant={SelectVariant.single}
                                    aria-label={t("defaultSigAlg")}
                                    isOpen={defaultSigAlgDrpdwnIsOpen}
                                    data-testid="select-default-sig-alg"
                                >
                                    {defaultSigAlgOptions!.map((p, idx) => (
                                        <option
                                            selected={p === field.value}
                                            key={`default-sig-alg-${idx}`}
                                            value={p}
                                        >
                                            {p}
                                        </option>
                                    ))}
                                </KeycloakSelect>
                            )}
                        />
                    </div>

                    {isFeatureEnabled(Feature.DeviceFlow) && (
                        <>
                            <div className="space-y-2">
                                <div className="flex items-center gap-1">
                                    <label htmlFor="oAuthDeviceCodeLifespan">{t("oAuthDeviceCodeLifespan")}</label>
                                    <HelpItem
                                        helpText={t("oAuthDeviceCodeLifespanHelp")}
                                        fieldLabelId="oAuthDeviceCodeLifespan"
                                    />
                                </div>
                                <Controller
                                    name="oauth2DeviceCodeLifespan"
                                    defaultValue={0}
                                    control={control}
                                    render={({ field }) => (
                                        <TimeSelector
                                            id="oAuthDeviceCodeLifespan"
                                            data-testid="oAuthDeviceCodeLifespan"
                                            value={field.value || 0}
                                            onChange={field.onChange}
                                            units={["minute", "hour", "day"]}
                                        />
                                    )}
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-1">
                                    <label htmlFor="oAuthDevicePollingInterval">{t("oAuthDevicePollingInterval")}</label>
                                    <HelpItem
                                        helpText={t("oAuthDevicePollingIntervalHelp")}
                                        fieldLabelId="oAuthDevicePollingInterval"
                                    />
                                </div>
                                <Controller
                                    name="oauth2DevicePollingInterval"
                                    defaultValue={0}
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            type="number"
                                            id="oAuthDevicePollingInterval"
                                            value={field.value}
                                            min={0}
                                            onChange={event => {
                                                const newValue = Number(
                                                    event.currentTarget.value
                                                );
                                                field.onChange(
                                                    !isNaN(newValue) ? newValue : 0
                                                );
                                            }}
                                            placeholder={t("oAuthDevicePollingInterval")}
                                        />
                                    )}
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-1">
                                    <label htmlFor="shortVerificationUri">{t("shortVerificationUri")}</label>
                                    <HelpItem
                                        helpText={t("shortVerificationUriTooltipHelp")}
                                        fieldLabelId="shortVerificationUri"
                                    />
                                </div>
                                <Input
                                    id="shortVerificationUri"
                                    placeholder={t("shortVerificationUri")}
                                    {...register("attributes.shortVerificationUri")}
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-1">
                                    <label htmlFor="parRequestUriLifespan">{t("parRequestUriLifespan")}</label>
                                    <HelpItem
                                        helpText={t("parRequestUriLifespanHelp")}
                                        fieldLabelId="parRequestUriLifespan"
                                    />
                                </div>
                                <Controller
                                    name="attributes.parRequestUriLifespan"
                                    control={control}
                                    render={({ field }) => (
                                        <TimeSelector
                                            id="parRequestUriLifespan"
                                            className="par-request-uri-lifespan"
                                            data-testid="par-request-uri-lifespan-input"
                                            aria-label="par-request-uri-lifespan"
                                            value={field.value}
                                            onChange={field.onChange}
                                        />
                                    )}
                                />
                            </div>
                        </>
                    )}
                </FormAccess>
            )
        },
        {
            title: t("refreshTokens"),
            panel: (
                <FormAccess
                    isHorizontal
                    role="manage-realm"
                    className="mt-4"
                    onSubmit={handleSubmit(save)}
                >
                    <div className="space-y-2">
                        <div className="flex items-center gap-1">
                            <label htmlFor="kc-revoke-refresh-token">{t("revokeRefreshToken")}</label>
                            <HelpItem
                                helpText={t("revokeRefreshTokenHelp")}
                                fieldLabelId="revokeRefreshToken"
                            />
                        </div>
                        <Controller
                            name="revokeRefreshToken"
                            control={control}
                            defaultValue={false}
                            render={({ field }) => (
                                <div className="flex items-center gap-2">
                                    <Switch
                                        id="kc-revoke-refresh-token"
                                        data-testid="revoke-refresh-token-switch"
                                        aria-label={t("revokeRefreshToken")}
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                    <span className="text-sm">{field.value ? t("enabled") : t("disabled")}</span>
                                </div>
                            )}
                        />
                    </div>
                    {revokeRefreshToken && (
                        <div className="space-y-2">
                            <div className="flex items-center gap-1">
                                <label htmlFor="refreshTokenMaxReuse">{t("refreshTokenMaxReuse")}</label>
                                <HelpItem
                                    helpText={t("refreshTokenMaxReuseHelp")}
                                    fieldLabelId="refreshTokenMaxReuse"
                                />
                            </div>
                            <Controller
                                name="refreshTokenMaxReuse"
                                defaultValue={0}
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        type="number"
                                        id="refreshTokenMaxReuseMs"
                                        value={field.value}
                                        onChange={event =>
                                            field.onChange(
                                                Number(
                                                    (event.target as HTMLInputElement)
                                                        .value
                                                )
                                            )
                                        }
                                    />
                                )}
                            />
                        </div>
                    )}
                </FormAccess>
            )
        },
        {
            title: t("accessTokens"),
            panel: (
                <FormAccess
                    isHorizontal
                    role="manage-realm"
                    className="mt-4"
                    onSubmit={handleSubmit(save)}
                >
                    <div className="space-y-2">
                        <div className="flex items-center gap-1">
                            <label htmlFor="accessTokenLifespan">{t("accessTokenLifespan")}</label>
                            <HelpItem
                                helpText={t("accessTokenLifespanHelp")}
                                fieldLabelId="accessTokenLifespan"
                            />
                        </div>
                        <Controller
                            name="accessTokenLifespan"
                            control={control}
                            render={({ field }) => (
                                <TimeSelector
                                    validated={
                                        field.value! > ssoSessionIdleTimeout!
                                            ? "warning"
                                            : "default"
                                    }
                                    className="kc-access-token-lifespan"
                                    data-testid="access-token-lifespan-input"
                                    aria-label="access-token-lifespan"
                                    value={field.value!}
                                    onChange={field.onChange}
                                    units={["minute", "hour", "day"]}
                                />
                            )}
                        />
                        <p className="text-sm text-muted-foreground">
                            {t("recommendedSsoTimeout", {
                                time: toHumanFormat(
                                    ssoSessionIdleTimeout!,
                                    whoAmI.locale
                                )
                            })}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center gap-1">
                            <label htmlFor="accessTokenLifespanImplicitFlow">{t("accessTokenLifespanImplicitFlow")}</label>
                            <HelpItem
                                helpText={t("accessTokenLifespanImplicitFlow")}
                                fieldLabelId="accessTokenLifespanImplicitFlow"
                            />
                        </div>
                        <Controller
                            name="accessTokenLifespanForImplicitFlow"
                            control={control}
                            render={({ field }) => (
                                <TimeSelector
                                    className="kc-access-token-lifespan-implicit"
                                    data-testid="access-token-lifespan-implicit-input"
                                    value={field.value!}
                                    onChange={field.onChange}
                                    units={["minute", "hour", "day"]}
                                />
                            )}
                        />
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-1">
                            <label htmlFor="clientLoginTimeout">{t("clientLoginTimeout")}</label>
                            <HelpItem
                                helpText={t("clientLoginTimeoutHelp")}
                                fieldLabelId="clientLoginTimeout"
                            />
                        </div>
                        <Controller
                            name="accessCodeLifespan"
                            control={control}
                            render={({ field }) => (
                                <TimeSelector
                                    className="kc-client-login-timeout"
                                    data-testid="client-login-timeout-input"
                                    aria-label="client-login-timeout"
                                    value={field.value!}
                                    onChange={field.onChange}
                                    units={["minute", "hour", "day"]}
                                />
                            )}
                        />
                    </div>

                    {offlineSessionMaxEnabled && (
                        <div className="space-y-2" id="offline-session-max-label">
                            <div className="flex items-center gap-1">
                                <label htmlFor="offlineSessionMax">{t("offlineSessionMax")}</label>
                                <HelpItem
                                    helpText={t("offlineSessionMaxHelp")}
                                    fieldLabelId="offlineSessionMax"
                                />
                            </div>
                            <Controller
                                name="offlineSessionMaxLifespan"
                                control={control}
                                render={({ field }) => (
                                    <TimeSelector
                                        className="kc-offline-session-max"
                                        data-testid="offline-session-max-input"
                                        value={field.value!}
                                        onChange={field.onChange}
                                        units={["minute", "hour", "day"]}
                                    />
                                )}
                            />
                        </div>
                    )}
                </FormAccess>
            )
        },
        {
            title: t("actionTokens"),
            panel: (
                <FormAccess
                    isHorizontal
                    role="manage-realm"
                    className="mt-4"
                    onSubmit={handleSubmit(save)}
                >
                    <div className="space-y-2" id="kc-user-initiated-action-lifespan">
                        <div className="flex items-center gap-1">
                            <label htmlFor="userInitiatedActionLifespan">{t("userInitiatedActionLifespan")}</label>
                            <HelpItem
                                helpText={t("userInitiatedActionLifespanHelp")}
                                fieldLabelId="userInitiatedActionLifespan"
                            />
                        </div>
                        <Controller
                            name="actionTokenGeneratedByUserLifespan"
                            control={control}
                            render={({ field }) => (
                                <TimeSelector
                                    className="kc-user-initiated-action-lifespan"
                                    data-testid="user-initiated-action-lifespan"
                                    aria-label="user-initiated-action-lifespan"
                                    value={field.value!}
                                    onChange={field.onChange}
                                    units={["minute", "hour", "day"]}
                                />
                            )}
                        />
                    </div>
                    <div className="space-y-2" id="default-admin-initiated-label">
                        <div className="flex items-center gap-1">
                            <label htmlFor="defaultAdminInitiated">{t("defaultAdminInitiated")}</label>
                            <HelpItem
                                helpText={t("defaultAdminInitiatedActionLifespanHelp")}
                                fieldLabelId="defaultAdminInitiated"
                            />
                        </div>
                        <Controller
                            name="actionTokenGeneratedByAdminLifespan"
                            control={control}
                            render={({ field }) => (
                                <TimeSelector
                                    className="kc-default-admin-initiated"
                                    data-testid="default-admin-initated-input"
                                    aria-label="default-admin-initated-input"
                                    value={field.value!}
                                    onChange={field.onChange}
                                    units={["minute", "hour", "day"]}
                                />
                            )}
                        />
                    </div>
                    <h1 className="kc-override-action-tokens-subtitle text-xl font-semibold">
                        {t("overrideActionTokens")}
                    </h1>
                    <div className="space-y-2" id="email-verification">
                        <div className="flex items-center gap-1">
                            <label htmlFor="emailVerification">{t("emailVerification")}</label>
                            <HelpItem
                                helpText={t("emailVerificationHelp")}
                                fieldLabelId="emailVerification"
                            />
                        </div>
                        <Controller
                            name={`attributes.${beerify(
                                "actionTokenGeneratedByUserLifespan.verify-email"
                            )}`}
                            defaultValue=""
                            control={control}
                            render={({ field }) => (
                                <TimeSelector
                                    className="kc-email-verification"
                                    data-testid="email-verification-input"
                                    value={field.value}
                                    onChange={value => field.onChange(value.toString())}
                                    units={["minute", "hour", "day"]}
                                />
                            )}
                        />
                    </div>
                    <div className="space-y-2" id="idp-acct-label">
                        <div className="flex items-center gap-1">
                            <label htmlFor="idpAccountEmailVerification">{t("idpAccountEmailVerification")}</label>
                            <HelpItem
                                helpText={t("idpAccountEmailVerificationHelp")}
                                fieldLabelId="idpAccountEmailVerification"
                            />
                        </div>
                        <Controller
                            name={`attributes.${beerify(
                                "actionTokenGeneratedByUserLifespan.idp-verify-account-via-email"
                            )}`}
                            defaultValue={""}
                            control={control}
                            render={({ field }) => (
                                <TimeSelector
                                    className="kc-idp-email-verification"
                                    data-testid="idp-email-verification-input"
                                    value={field.value}
                                    onChange={field.onChange}
                                    units={["minute", "hour", "day"]}
                                />
                            )}
                        />
                    </div>
                    <div className="space-y-2" id="forgot-password-label">
                        <div className="flex items-center gap-1">
                            <label htmlFor="forgotPassword">{t("forgotPassword")}</label>
                            <HelpItem
                                helpText={t("forgotPasswordHelp")}
                                fieldLabelId="forgotPassword"
                            />
                        </div>
                        <Controller
                            name={`attributes.${beerify(
                                "actionTokenGeneratedByUserLifespan.reset-credentials"
                            )}`}
                            defaultValue={""}
                            control={control}
                            render={({ field }) => (
                                <TimeSelector
                                    className="kc-forgot-pw"
                                    data-testid="forgot-pw-input"
                                    value={field.value}
                                    onChange={field.onChange}
                                    units={["minute", "hour", "day"]}
                                />
                            )}
                        />
                    </div>
                    <div className="space-y-2" id="execute-actions">
                        <div className="flex items-center gap-1">
                            <label htmlFor="executeActions">{t("executeActions")}</label>
                            <HelpItem
                                helpText={t("executeActionsHelp")}
                                fieldLabelId="executeActions"
                            />
                        </div>
                        <Controller
                            name={`attributes.${beerify(
                                "actionTokenGeneratedByUserLifespan.execute-actions"
                            )}`}
                            defaultValue={""}
                            control={control}
                            render={({ field }) => (
                                <TimeSelector
                                    className="kc-execute-actions"
                                    data-testid="execute-actions-input"
                                    value={field.value}
                                    onChange={field.onChange}
                                    units={["minute", "hour", "day"]}
                                />
                            )}
                        />
                    </div>
                    {!isFeatureEnabled(Feature.OpenId4VCI) && (
                        <FixedButtonsGroup
                            name="tokens-tab"
                            isSubmit
                            isDisabled={!formState.isDirty}
                            reset={() => reset(realm)}
                        />
                    )}
                </FormAccess>
            )
        },
        {
            title: t("oid4vciAttributes"),
            isHidden: !isFeatureEnabled(Feature.OpenId4VCI),
            panel: (
                <FormAccess
                    isHorizontal
                    role="manage-realm"
                    className="mt-4"
                    onSubmit={handleSubmit(save, onError)}
                >
                    <TimeSelectorControl
                        name={convertAttributeNameToForm(
                            "attributes.vc.c-nonce-lifetime-seconds"
                        )}
                        label={t("oid4vciNonceLifetime")}
                        labelIcon={t("oid4vciNonceLifetimeHelp")}
                        controller={{
                            defaultValue: 60,
                            rules: { min: 30 }
                        }}
                        min={30}
                        units={["second", "minute", "hour"]}
                    />
                    <TimeSelectorControl
                        name={convertAttributeNameToForm(
                            "attributes.preAuthorizedCodeLifespanS"
                        )}
                        label={t("preAuthorizedCodeLifespan")}
                        labelIcon={t("preAuthorizedCodeLifespanHelp")}
                        controller={{
                            defaultValue: 30,
                            rules: { min: 30 }
                        }}
                        min={30}
                        units={["second", "minute", "hour"]}
                    />
                    <DefaultSwitchControl
                        name={convertAttributeNameToForm(
                            "attributes.oid4vci.signed_metadata.enabled"
                        )}
                        label={t("signedIssuerMetadata")}
                        labelIcon={t("signedIssuerMetadataHelp")}
                        stringify
                        data-testid="signed-metadata-switch"
                    />
                    {signedMetadataEnabled === "true" && (
                        <>
                            <TimeSelectorControl
                                name={convertAttributeNameToForm(
                                    "attributes.oid4vci.signed_metadata.lifespan"
                                )}
                                label={t("signedMetadataLifespan")}
                                labelIcon={t("signedMetadataLifespanHelp")}
                                controller={{
                                    defaultValue: 60
                                }}
                                units={["second", "minute", "hour"]}
                                data-testid="signed-metadata-lifespan"
                            />
                            <SelectControl
                                name={convertAttributeNameToForm(
                                    "attributes.oid4vci.signed_metadata.alg"
                                )}
                                label={t("signedMetadataSigningAlgorithm")}
                                labelIcon={t("signedMetadataSigningAlgorithmHelp")}
                                controller={{
                                    defaultValue: "RS256"
                                }}
                                options={asymmetricSigAlgOptions.map(p => ({
                                    key: p,
                                    value: p
                                }))}
                                data-testid="signed-metadata-signing-algorithm"
                            />
                        </>
                    )}
                    <DefaultSwitchControl
                        name={convertAttributeNameToForm(
                            "attributes.oid4vci.encryption.required"
                        )}
                        label={t("requireEncryption")}
                        labelIcon={t("requireEncryptionHelp")}
                        stringify
                        data-testid="require-encryption-switch"
                    />
                    {encryptionRequired === "true" && (
                        <DefaultSwitchControl
                            name={convertAttributeNameToForm(
                                "attributes.oid4vci.request.zip.algorithms"
                            )}
                            label={t("enableDeflateCompression")}
                            labelIcon={t("enableDeflateCompressionHelp")}
                            data-testid="deflate-compression-switch"
                            stringify
                        />
                    )}
                    <NumberControl
                        name={convertAttributeNameToForm(
                            "attributes.oid4vci.batch_credential_issuance.batch_size"
                        )}
                        label={t("batchIssuanceSize")}
                        labelIcon={t("batchIssuanceSizeHelp")}
                        min={2}
                        controller={{
                            defaultValue: 2,
                            rules: { min: 2 }
                        }}
                        data-testid="batch-issuance-size"
                    />

                    <h1 className="kc-override-action-tokens-subtitle text-xl font-semibold">
                        {t("attestationTrust")}
                    </h1>
                    <div className="space-y-2">
                        <div className="flex items-center gap-1">
                            <label htmlFor="trustedKeyIds">{t("trustedKeyIds")}</label>
                            <HelpItem
                                helpText={t("trustedKeyIdsHelp")}
                                fieldLabelId="trustedKeyIds"
                            />
                        </div>
                        <Input
                            id="trustedKeyIds"
                            data-testid="trusted-key-ids"
                            {...register(
                                convertAttributeNameToForm(
                                    "attributes.oid4vc.attestation.trusted_key_ids"
                                )
                            )}
                        />
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-1">
                            <label htmlFor="trustedKeys">{t("trustedKeys")}</label>
                            <HelpItem
                                helpText={t("trustedKeysHelp")}
                                fieldLabelId="trustedKeys"
                            />
                        </div>
                        <Controller
                            name={convertAttributeNameToForm(
                                "attributes.oid4vc.attestation.trusted_keys"
                            )}
                            control={control}
                            defaultValue={
                                realm.attributes?.["oid4vc.attestation.trusted_keys"]
                            }
                            render={({ field }) => (
                                <Textarea
                                    id="trustedKeys"
                                    data-testid="trusted-keys"
                                    value={field.value}
                                    onChange={e => field.onChange(e.target.value)}
                                    className="resize-y"
                                />
                            )}
                        />
                    </div>

                    <h1 className="kc-override-action-tokens-subtitle text-xl font-semibold">
                        {t("timeClaimCorrelationMitigation")}
                    </h1>
                    <SelectControl
                        name={convertAttributeNameToForm(
                            "attributes.oid4vci.time.claims.strategy"
                        )}
                        label={t("timeClaimsStrategy")}
                        labelIcon={t("timeClaimsStrategyHelp")}
                        controller={{
                            defaultValue: "off"
                        }}
                        options={[
                            { key: "off", value: t("off") },
                            { key: "randomize", value: t("randomize") },
                            { key: "round", value: t("round") }
                        ]}
                        data-testid="time-claims-strategy"
                    />
                    {strategy === "randomize" && (
                        <NumberControl
                            name={convertAttributeNameToForm(
                                "attributes.oid4vci.time.randomize.window.seconds"
                            )}
                            label={t("randomizeWindow")}
                            labelIcon={t("randomizeWindowHelp")}
                            min={1}
                            controller={{
                                defaultValue: 86400,
                                rules: { min: 1 }
                            }}
                            data-testid="randomize-window"
                            widthChars={6}
                        />
                    )}
                    {strategy === "round" && (
                        <SelectControl
                            name={convertAttributeNameToForm(
                                "attributes.oid4vci.time.round.unit"
                            )}
                            label={t("roundUnit")}
                            labelIcon={t("roundUnitHelp")}
                            controller={{
                                defaultValue: "SECOND"
                            }}
                            options={[
                                { key: "SECOND", value: t("times.seconds") },
                                { key: "MINUTE", value: t("times.minutes") },
                                { key: "HOUR", value: t("times.hours") },
                                { key: "DAY", value: t("times.days") }
                            ]}
                            data-testid="round-unit"
                        />
                    )}
                    <FixedButtonsGroup
                        name="tokens-tab"
                        isSubmit
                        isDisabled={!formState.isDirty}
                        reset={() => reset(realm)}
                    />
                </FormAccess>
            )
        }
    ];

    return (
        <ScrollForm
            label={t("jumpToSection")}
            className="px-4 pb-4"
            sections={sections}
        />
    );
};
