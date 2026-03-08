import type RealmRepresentation from "@keycloak/keycloak-admin-client/lib/defs/realmRepresentation";
import { useTranslation } from "@merge-rd/i18n";
import { Input } from "@merge-rd/ui/components/input";
import { Textarea } from "@merge-rd/ui/components/textarea";
import { memo } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { HelpItem, NumberControl, SelectField } from "../../../shared/keycloak-ui-shared";
import { useServerInfo } from "../../app/providers/server-info/server-info-provider";
import { convertAttributeNameToForm } from "../../shared/lib/util";
import { FixedButtonsGroup } from "../../shared/ui/form/fixed-button-group";
import { FormAccess } from "../../shared/ui/form/form-access";
import { DefaultSwitchControl } from "../../shared/ui/switch-control";
import { TimeSelectorControl } from "../../shared/ui/time-selector/time-selector-control";

type TokensTabOid4vciSectionProps = {
    realm: RealmRepresentation;
    save: (realm: RealmRepresentation) => void;
};

export const TokensTabOid4vciSection = memo(function TokensTabOid4vciSection({
    realm,
    save
}: TokensTabOid4vciSectionProps) {
    const { t } = useTranslation();
    const serverInfo = useServerInfo();
    const { control, register, reset, formState, handleSubmit } =
        useFormContext<RealmRepresentation>();

    const asymmetricSigAlgOptions =
        serverInfo.cryptoInfo?.clientSignatureAsymmetricAlgorithms ?? [];

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

    const onError = () => {
        toast.error(t("oid4vciFormValidationError"));
    };

    return (
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
                name={convertAttributeNameToForm("attributes.preAuthorizedCodeLifespanS")}
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
                    <SelectField
                        name={convertAttributeNameToForm(
                            "attributes.oid4vci.signed_metadata.alg"
                        )}
                        label={t("signedMetadataSigningAlgorithm")}
                        labelIcon={t("signedMetadataSigningAlgorithmHelp")}
                        defaultValue="RS256"
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
                    defaultValue={realm.attributes?.["oid4vc.attestation.trusted_keys"]}
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
            <SelectField
                name={convertAttributeNameToForm(
                    "attributes.oid4vci.time.claims.strategy"
                )}
                label={t("timeClaimsStrategy")}
                labelIcon={t("timeClaimsStrategyHelp")}
                defaultValue="off"
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
                <SelectField
                    name={convertAttributeNameToForm(
                        "attributes.oid4vci.time.round.unit"
                    )}
                    label={t("roundUnit")}
                    labelIcon={t("roundUnitHelp")}
                    defaultValue="SECOND"
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
    );
});
