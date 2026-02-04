import type CertificateRepresentation from "@keycloak/keycloak-admin-client/lib/defs/certificateRepresentation";
import { getErrorDescription, getErrorMessage, FormPanel,
    HelpItem,
    useFetch } from "../../../shared/keycloak-ui-shared";
import { toast } from "@merge/ui/components/sonner";
import { Button } from "@merge/ui/components/button";
import { Label } from "@merge/ui/components/label";
import { Switch } from "@merge/ui/components/switch";
import { saveAs } from "file-saver";
import { Fragment, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useAdminClient } from "../../admin-client";
import { useConfirmDialog } from "../../components/confirm-dialog/ConfirmDialog";
import { FormAccess } from "../../components/form/FormAccess";
import { convertAttributeNameToForm } from "../../util";
import useToggle from "../../utils/useToggle";
import { FormFields } from "../ClientDetails";
import { Certificate } from "./Certificate";
import { ExportSamlKeyDialog } from "./ExportSamlKeyDialog";
import { SamlImportKeyDialog } from "./SamlImportKeyDialog";
import { SamlKeysDialog } from "./SamlKeysDialog";

type SamlKeysProps = {
    clientId: string;
    save: () => void;
};

type KeyMapping = {
    name: string;
    title: string;
    key: string;
    regenerateKey: string;
    relatedKeys: string[];
};

const KEYS = ["saml.signing", "saml.encryption"] as const;
export type KeyTypes = (typeof KEYS)[number];

const KEYS_MAPPING: { [key in KeyTypes]: KeyMapping } = {
    "saml.signing": {
        name: convertAttributeNameToForm("attributes.saml.client.signature"),
        title: "signingKeysConfig",
        key: "clientSignature",
        regenerateKey: "reGenerateSigning",
        relatedKeys: []
    },
    "saml.encryption": {
        name: convertAttributeNameToForm("attributes.saml.encrypt"),
        title: "encryptionKeysConfig",
        key: "encryptAssertions",
        regenerateKey: "reGenerateEncryption",
        relatedKeys: [
            convertAttributeNameToForm("attributes.saml.encryption.algorithm"),
            convertAttributeNameToForm("attributes.saml.encryption.keyAlgorithm"),
            convertAttributeNameToForm("attributes.saml.encryption.digestMethod"),
            convertAttributeNameToForm(
                "attributes.saml.encryption.maskGenerationFunction"
            )
        ]
    }
};

type KeySectionProps = {
    clientId: string;
    keyInfo?: CertificateRepresentation;
    attr: KeyTypes;
    onChanged: (key: KeyTypes) => void;
    onGenerate: (key: KeyTypes, regenerate: boolean) => void;
    onImport: (key: KeyTypes) => void;
    save: () => void;
};

const KeySection = ({
    clientId,
    keyInfo,
    attr,
    onChanged,
    onGenerate,
    onImport,
    save
}: KeySectionProps) => {
    const { t } = useTranslation();
    const { control, watch } = useFormContext<FormFields>();
    const title = KEYS_MAPPING[attr].title;
    const key = KEYS_MAPPING[attr].key;
    const name = KEYS_MAPPING[attr].name;

    const [showImportDialog, toggleImportDialog] = useToggle();

    const section = watch(name as keyof FormFields);

    const useMetadataDescriptorUrl = watch(
        convertAttributeNameToForm<FormFields>(
            "attributes.saml.useMetadataDescriptorUrl"
        ),
        "false"
    );

    return (
        <>
            {showImportDialog && (
                <ExportSamlKeyDialog
                    keyType={attr}
                    clientId={clientId}
                    close={toggleImportDialog}
                />
            )}
            <FormPanel title={t(title)} className="kc-form-panel__panel">
                <p className="pb-4 text-sm text-muted-foreground">{t(`${title}Explain`)}</p>
                <FormAccess role="manage-clients" isHorizontal>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Label>{t(key)}</Label>
                            <HelpItem helpText={t(`${key}Help`)} fieldLabelId={key} />
                        </div>
                        <Controller
                            name={name as keyof FormFields}
                            control={control}
                            defaultValue="false"
                            render={({ field }) => (
                                <Switch
                                    data-testid={key}
                                    id={key}
                                    checked={field.value === "true"}
                                    onCheckedChange={(checked) => {
                                        const v = checked.toString();
                                        if (
                                            v === "true" &&
                                            useMetadataDescriptorUrl === "true"
                                        ) {
                                            field.onChange(v);
                                            save();
                                        } else if (v === "true") {
                                            onChanged(attr);
                                            field.onChange(v);
                                        } else {
                                            onGenerate(attr, false);
                                        }
                                    }}
                                    aria-label={t(key)}
                                />
                            )}
                        />
                    </div>
                </FormAccess>
            </FormPanel>
            {useMetadataDescriptorUrl !== "true" &&
                keyInfo?.certificate &&
                section === "true" && (
                    <div className="border rounded-lg">
                        <div className="p-4">
                            <form className="space-y-4">
                                <Certificate
                                    helpTextKey={`saml${key}CertificateHelp`}
                                    keyInfo={keyInfo}
                                />
                                <div className="flex gap-2">
                                    <Button
                                        variant="secondary"
                                        onClick={() => onGenerate(attr, true)}
                                    >
                                        {t("regenerate")}
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        onClick={() => onImport(attr)}
                                    >
                                        {t("importKey")}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={toggleImportDialog}
                                    >
                                        {t("export")}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
        </>
    );
};

export const SamlKeys = ({ clientId, save }: SamlKeysProps) => {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
    const [isChanged, setIsChanged] = useState<KeyTypes>();
    const [keyInfo, setKeyInfo] = useState<CertificateRepresentation[]>();
    const [selectedType, setSelectedType] = useState<KeyTypes>();
    const [openImport, setImportOpen] = useState<KeyTypes>();
    const [refresh, setRefresh] = useState(0);

    const { setValue } = useFormContext();
useFetch(
        () =>
            Promise.all(
                KEYS.map(attr => adminClient.clients.getKeyInfo({ id: clientId, attr }))
            ),
        info => setKeyInfo(info),
        [refresh]
    );

    const generate = async (attr: KeyTypes) => {
        const index = KEYS.indexOf(attr);
        try {
            const info = [...(keyInfo || [])];
            info[index] = await adminClient.clients.generateKey({
                id: clientId,
                attr
            });

            setKeyInfo(info);
            saveAs(
                new Blob([info[index].privateKey!], {
                    type: "application/octet-stream"
                }),
                "private.key"
            );

            toast.success(t("generateSuccess"));
        } catch (error) {
            toast.error(t("generateError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
        }
    };

    const key = selectedType ? KEYS_MAPPING[selectedType].key : "";
    const [toggleDisableDialog, DisableConfirm] = useConfirmDialog({
        titleKey: t("disableSigning", {
            key: t(key)
        }),
        messageKey: t("disableSigningExplain", {
            key: t(key)
        }),
        continueButtonLabel: "yes",
        cancelButtonLabel: "no",
        onConfirm: () => {
            setValue(KEYS_MAPPING[selectedType!].name, "false");
            for (const key of KEYS_MAPPING[selectedType!].relatedKeys) {
                setValue(key, ""); // remove related attributes when disabled
            }
            save();
        }
    });

    const regenerateKey = selectedType ? KEYS_MAPPING[selectedType].regenerateKey : "";
    const [toggleReGenerateDialog, ReGenerateConfirm] = useConfirmDialog({
        titleKey: regenerateKey,
        messageKey: regenerateKey + "Explain",
        continueButtonLabel: "yes",
        cancelButtonLabel: "no",
        onConfirm: async () => {
            await generate(selectedType!);
        }
    });

    return (
        <div className="p-6">
            {isChanged && (
                <SamlKeysDialog
                    id={clientId}
                    attr={isChanged}
                    localeKey={key}
                    onClose={() => {
                        setIsChanged(undefined);
                        for (const key of KEYS_MAPPING[selectedType!].relatedKeys) {
                            setValue(key, ""); // take defaults when enabled
                        }
                        save();
                        setRefresh(refresh + 1);
                    }}
                    onCancel={() => {
                        setValue(KEYS_MAPPING[selectedType!].name, "false");
                        setIsChanged(undefined);
                    }}
                />
            )}
            <DisableConfirm />
            <ReGenerateConfirm />
            {KEYS.map((attr, index) => (
                <Fragment key={attr}>
                    {openImport === attr && (
                        <SamlImportKeyDialog
                            id={clientId}
                            attr={attr}
                            onClose={() => setImportOpen(undefined)}
                            onImported={() => setRefresh(refresh + 1)}
                        />
                    )}
                    <KeySection
                        clientId={clientId}
                        keyInfo={keyInfo?.[index]}
                        attr={attr}
                        onChanged={type => {
                            setIsChanged(type);
                            setSelectedType(type);
                        }}
                        onGenerate={(type, isNew) => {
                            setSelectedType(type);
                            if (!isNew) {
                                toggleDisableDialog();
                            } else {
                                toggleReGenerateDialog();
                            }
                        }}
                        onImport={() => setImportOpen(attr)}
                        save={save}
                    />
                </Fragment>
            ))}
        </div>
    );
};
