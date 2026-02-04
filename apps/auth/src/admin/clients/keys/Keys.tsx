import type CertificateRepresentation from "@keycloak/keycloak-admin-client/lib/defs/certificateRepresentation";
import type KeyStoreConfig from "@keycloak/keycloak-admin-client/lib/defs/keystoreConfig";
import { getErrorDescription, getErrorMessage, TextControl, useFetch } from "../../../shared/keycloak-ui-shared";
import { toast } from "@merge/ui/components/sonner";
import { Button } from "@merge/ui/components/button";
import { saveAs } from "file-saver";
import { useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useAdminClient } from "../../admin-client";
import { FormAccess } from "../../components/form/FormAccess";
import { DefaultSwitchControl } from "../../components/SwitchControl";
import { convertAttributeNameToForm } from "../../util";
import useToggle from "../../utils/useToggle";
import { FormFields } from "../ClientDetails";
import { Certificate } from "./Certificate";
import { GenerateKeyDialog, getFileExtension } from "./GenerateKeyDialog";
import { ImportFile, ImportKeyDialog } from "./ImportKeyDialog";

type KeysProps = {
    save: () => void;
    refresh: () => void;
    clientId: string;
    hasConfigureAccess?: boolean;
};

const attr = "jwt.credential";

export const Keys = ({
    clientId,
    save,
    refresh: refreshParent,
    hasConfigureAccess
}: KeysProps) => {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
    const {
        control,
        getValues,
        formState: { isDirty }
    } = useFormContext<FormFields>();
const [keyInfo, setKeyInfo] = useState<CertificateRepresentation>();
    const [openGenerateKeys, toggleOpenGenerateKeys, setOpenGenerateKeys] = useToggle();
    const [openImportKeys, toggleOpenImportKeys, setOpenImportKeys] = useToggle();
    const [key, setKey] = useState(0);
    const refresh = () => {
        setKey(key + 1);
        refreshParent();
    };

    const useJwksUrl = useWatch({
        control,
        name: convertAttributeNameToForm<FormFields>("attributes.use.jwks.url"),
        defaultValue: "false"
    });

    useFetch(
        async () => {
            try {
                return await adminClient.clients.getKeyInfo({ id: clientId, attr });
            } catch (error) {
                toast.error(t("getKeyInfoError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
                return {} as CertificateRepresentation;
            }
        },
        info => setKeyInfo(info),
        [key]
    );

    const generate = async (config: KeyStoreConfig) => {
        try {
            const keyStore = await adminClient.clients.generateAndDownloadKey(
                {
                    id: clientId,
                    attr
                },
                config
            );
            saveAs(
                new Blob([keyStore], { type: "application/octet-stream" }),
                `keystore.${getFileExtension(config.format ?? "")}`
            );
            toast.success(t("generateSuccess"));
            refresh();
        } catch (error) {
            toast.error(t("generateError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
        }
    };

    const importKey = async (importFile: ImportFile) => {
        try {
            const formData = new FormData();
            const { file, ...rest } = importFile;

            for (const [key, value] of Object.entries(rest)) {
                formData.append(key, value);
            }

            formData.append("file", file);
            await adminClient.clients.uploadCertificate({ id: clientId, attr }, formData);
            toast.success(t("importSuccess"));
            refresh();
        } catch (error) {
            toast.error(t("importError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
        }
    };

    return (
        <div className="p-6">
            {openGenerateKeys && (
                <GenerateKeyDialog
                    clientId={getValues("clientId")!}
                    toggleDialog={toggleOpenGenerateKeys}
                    save={generate}
                />
            )}
            {openImportKeys && (
                <ImportKeyDialog toggleDialog={toggleOpenImportKeys} save={importKey} />
            )}
            <div className="border rounded-lg">
                <div className="p-4 border-b">
                    <h3 className="text-lg font-semibold">{t("jwksUrlConfig")}</h3>
                </div>
                <div className="p-4">
                    <p className="text-sm text-muted-foreground">{t("keysIntro")}</p>
                </div>
                <div className="p-4">
                    <FormAccess
                        role="manage-clients"
                        fineGrainedAccess={hasConfigureAccess}
                        isHorizontal
                    >
                        <DefaultSwitchControl
                            name={convertAttributeNameToForm("attributes.use.jwks.url")}
                            label={t("useJwksUrl")}
                            labelIcon={t("useJwksUrlHelp")}
                            stringify
                        />
                        {useJwksUrl !== "true" &&
                            (keyInfo ? (
                                <Certificate plain keyInfo={keyInfo} />
                            ) : (
                                "No client certificate configured"
                            ))}
                        {useJwksUrl === "true" && (
                            <TextControl
                                name={convertAttributeNameToForm("attributes.jwks.url")}
                                label={t("jwksUrl")}
                                labelIcon={t("jwksUrlHelp")}
                                type="url"
                            />
                        )}
                        <div className="flex gap-2 mt-4">
                            <Button
                                data-testid="saveKeys"
                                onClick={save}
                                disabled={!isDirty}
                            >
                                {t("save")}
                            </Button>
                            <Button
                                data-testid="generate"
                                variant="secondary"
                                onClick={() => setOpenGenerateKeys(true)}
                            >
                                {t("generateNewKeys")}
                            </Button>
                            <Button
                                data-testid="import"
                                variant="secondary"
                                onClick={() => setOpenImportKeys(true)}
                                disabled={useJwksUrl === "true"}
                            >
                                {t("import")}
                            </Button>
                        </div>
                    </FormAccess>
                </div>
            </div>
        </div>
    );
};
