import { ProviderRepresentation } from "@keycloak/keycloak-admin-client/lib/defs/serverInfoRepesentation";
import { Button } from "@merge/ui/components/button";
import { Switch } from "@merge/ui/components/switch";
import { Label } from "@merge/ui/components/label";
import { useTranslation } from "react-i18next";
import { HelpItem, SelectField } from "../../../shared/keycloak-ui-shared";
import { FormAccess } from "../../components/form/FormAccess";
import { MultiLineInput } from "../../components/multi-line-input/MultiLineInput";
import { useServerInfo } from "../../context/server-info/ServerInfoProvider";
import { convertAttributeNameToForm, sortProviders } from "../../util";
import { FormFields } from "../ClientDetails";
import { ApplicationUrls } from "./ApplicationUrls";
import { Controller, useFormContext } from "react-hook-form";

type FineGrainOpenIdConnectProps = {
    save: () => void;
    reset: () => void;
    hasConfigureAccess?: boolean;
};

export const FineGrainOpenIdConnect = ({
    save,
    reset,
    hasConfigureAccess
}: FineGrainOpenIdConnectProps) => {
    const { t } = useTranslation();
    const { control } = useFormContext();
    const providers = useServerInfo().providers;
    const clientSignatureProviders = providers?.clientSignature.providers;
    const contentEncryptionProviders = providers?.contentencryption.providers;
    const cekManagementProviders = providers?.cekmanagement.providers;
    const signatureProviders = providers?.signature.providers;

    const convert = (list: { [index: string]: ProviderRepresentation }) =>
        sortProviders(list).map(i => ({ key: i, value: i }));

    const prependEmpty = (list: { [index: string]: ProviderRepresentation }) => [
        { key: "", value: t("choose") },
        ...convert(list)
    ];

    const prependNone = (list: { [index: string]: ProviderRepresentation }) => [
        { key: "none", value: t("none") },
        ...convert(list)
    ];

    return (
        <FormAccess
            role="manage-clients"
            fineGrainedAccess={hasConfigureAccess}
            isHorizontal
        >
            <ApplicationUrls />
            <SelectField
                name={convertAttributeNameToForm<FormFields>(
                    "attributes.access.token.signed.response.alg"
                )}
                label={t("accessTokenSignatureAlgorithm")}
                labelIcon={t("accessTokenSignatureAlgorithmHelp")}
                defaultValue=""
                options={prependEmpty(clientSignatureProviders!)}
            />
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <Label htmlFor="useRfc9068AccessTokenType">{t("useRfc9068AccessTokenType")}</Label>
                    <HelpItem
                        helpText={t("useRfc9068AccessTokenTypeHelp")}
                        fieldLabelId="useRfc9068AccessTokenType"
                    />
                </div>
                <Controller
                    name={convertAttributeNameToForm<FormFields>(
                        "attributes.access.token.header.type.rfc9068"
                    )}
                    defaultValue="false"
                    control={control}
                    render={({ field }) => (
                        <Switch
                            id="useRfc9068AccessTokenType"
                            checked={field.value === "true"}
                            onCheckedChange={(value) => field.onChange(value.toString())}
                            aria-label={t("useRfc9068AccessTokenType")}
                        />
                    )}
                />
            </div>
            <SelectField
                name={convertAttributeNameToForm<FormFields>(
                    "attributes.id.token.signed.response.alg"
                )}
                label={t("idTokenSignatureAlgorithm")}
                labelIcon={t("idTokenSignatureAlgorithmHelp")}
                defaultValue=""
                options={prependEmpty(clientSignatureProviders!)}
            />
            <SelectField
                name={convertAttributeNameToForm<FormFields>(
                    "attributes.id.token.encrypted.response.alg"
                )}
                label={t("idTokenEncryptionKeyManagementAlgorithm")}
                labelIcon={t("idTokenEncryptionKeyManagementAlgorithmHelp")}
                defaultValue=""
                options={prependEmpty(cekManagementProviders!)}
            />
            <SelectField
                name={convertAttributeNameToForm<FormFields>(
                    "attributes.id.token.encrypted.response.enc"
                )}
                label={t("idTokenEncryptionContentEncryptionAlgorithm")}
                labelIcon={t("idTokenEncryptionContentEncryptionAlgorithmHelp")}
                defaultValue=""
                options={prependEmpty(contentEncryptionProviders!)}
            />
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <Label htmlFor="idTokenAsDetachedSignature">{t("idTokenAsDetachedSignature")}</Label>
                    <HelpItem
                        helpText={t("idTokenAsDetachedSignatureHelp")}
                        fieldLabelId="idTokenAsDetachedSignature"
                    />
                </div>
                <Controller
                    name={convertAttributeNameToForm<FormFields>(
                        "attributes.id.token.as.detached.signature"
                    )}
                    defaultValue="false"
                    control={control}
                    render={({ field }) => (
                        <Switch
                            id="idTokenAsDetachedSignature"
                            checked={field.value === "true"}
                            onCheckedChange={(value) => field.onChange(value.toString())}
                            aria-label={t("idTokenAsDetachedSignature")}
                        />
                    )}
                />
            </div>
            <SelectField
                name={convertAttributeNameToForm<FormFields>(
                    "attributes.user.info.response.signature.alg"
                )}
                label={t("userInfoSignedResponseAlgorithm")}
                labelIcon={t("userInfoSignedResponseAlgorithmHelp")}
                defaultValue=""
                options={prependEmpty(signatureProviders!)}
            />
            <SelectField
                name={convertAttributeNameToForm<FormFields>(
                    "attributes.user.info.encrypted.response.alg"
                )}
                label={t("userInfoResponseEncryptionKeyManagementAlgorithm")}
                labelIcon={t("userInfoResponseEncryptionKeyManagementAlgorithmHelp")}
                defaultValue=""
                options={prependEmpty(cekManagementProviders!)}
            />
            <SelectField
                name={convertAttributeNameToForm<FormFields>(
                    "attributes.user.info.encrypted.response.enc"
                )}
                label={t("userInfoResponseEncryptionContentEncryptionAlgorithm")}
                labelIcon={t("userInfoResponseEncryptionContentEncryptionAlgorithmHelp")}
                defaultValue=""
                options={prependEmpty(contentEncryptionProviders!)}
            />
            <SelectField
                name={convertAttributeNameToForm<FormFields>(
                    "attributes.request.object.signature.alg"
                )}
                label={t("requestObjectSignatureAlgorithm")}
                labelIcon={t("requestObjectSignatureAlgorithmHelp")}
                defaultValue=""
                options={prependNone(clientSignatureProviders!)}
            />
            <SelectField
                name={convertAttributeNameToForm<FormFields>(
                    "attributes.request.object.encryption.alg"
                )}
                label={t("requestObjectEncryption")}
                labelIcon={t("requestObjectEncryptionHelp")}
                defaultValue=""
                options={prependEmpty(cekManagementProviders!)}
            />
            <SelectField
                name={convertAttributeNameToForm<FormFields>(
                    "attributes.request.object.encryption.enc"
                )}
                label={t("requestObjectEncoding")}
                labelIcon={t("requestObjectEncodingHelp")}
                defaultValue=""
                options={prependEmpty(contentEncryptionProviders!)}
            />
            <SelectField
                name={convertAttributeNameToForm<FormFields>(
                    "attributes.request.object.required"
                )}
                label={t("requestObjectRequired")}
                labelIcon={t("requestObjectRequiredHelp")}
                defaultValue="not required"
                options={[
                    "not required",
                    "request or request_uri",
                    "request only",
                    "request_uri only"
                ].map(p => ({
                    key: p,
                    value: t(`requestObject.${p}`)
                }))}
            />
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <Label htmlFor="validRequestURIs">{t("validRequestURIs")}</Label>
                    <HelpItem
                        helpText={t("validRequestURIsHelp")}
                        fieldLabelId="validRequestURIs"
                    />
                </div>
                <MultiLineInput
                    name={convertAttributeNameToForm("attributes.request.uris")}
                    aria-label={t("validRequestURIs")}
                    addButtonLabel="addRequestUri"
                    stringify
                />
            </div>
            <SelectField
                name={convertAttributeNameToForm<FormFields>(
                    "attributes.authorization.signed.response.alg"
                )}
                label={t("authorizationSignedResponseAlg")}
                labelIcon={t("authorizationSignedResponseAlgHelp")}
                defaultValue=""
                options={prependEmpty(signatureProviders!)}
            />
            <SelectField
                name={convertAttributeNameToForm<FormFields>(
                    "attributes.authorization.encrypted.response.alg"
                )}
                label={t("authorizationEncryptedResponseAlg")}
                labelIcon={t("authorizationEncryptedResponseAlgHelp")}
                defaultValue=""
                options={prependEmpty(cekManagementProviders!)}
            />
            <SelectField
                name={convertAttributeNameToForm<FormFields>(
                    "attributes.authorization.encrypted.response.enc"
                )}
                label={t("authorizationEncryptedResponseEnc")}
                labelIcon={t("authorizationEncryptedResponseEncHelp")}
                defaultValue=""
                options={prependEmpty(contentEncryptionProviders!)}
            />
            <div className="flex gap-2">
                <Button
                    variant="secondary"
                    id="fineGrainSave"
                    data-testid="fineGrainSave"
                    onClick={save}
                >
                    {t("save")}
                </Button>
                <Button
                    id="fineGrainRevert"
                    data-testid="fineGrainRevert"
                    variant="link"
                    onClick={reset}
                >
                    {t("revert")}
                </Button>
            </div>
        </FormAccess>
    );
};
