import type KeyStoreConfig from "@keycloak/keycloak-admin-client/lib/defs/keystoreConfig";
import { useTranslation } from "@merge-rd/i18n";
import { Button } from "@merge-rd/ui/components/button";
import { saveAs } from "file-saver";
import { useFormContext, useWatch } from "react-hook-form";
import { toast } from "sonner";
import {
    getErrorDescription,
    getErrorMessage,
    TextControl
} from "../../../../shared/keycloak-ui-shared";
import { useAdminClient } from "../../../app/admin-client";
import useToggle from "../../../shared/lib/useToggle";
import { convertAttributeNameToForm } from "../../../shared/lib/util";
import { FormAccess } from "../../../shared/ui/form/form-access";
import { DefaultSwitchControl } from "../../../shared/ui/switch-control";
import { useClientKeyInfo } from "../api/use-client-key-info";
import type { FormFields } from "../client-details";
import { Certificate } from "./certificate";
import { GenerateKeyDialog, getFileExtension } from "./generate-key-dialog";
import { type ImportFile, ImportKeyDialog } from "./import-key-dialog";

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
    const { data: keyInfo, refetch: refetchKeyInfo } = useClientKeyInfo(clientId, attr);
    const [openGenerateKeys, toggleOpenGenerateKeys, setOpenGenerateKeys] = useToggle();
    const [openImportKeys, toggleOpenImportKeys, setOpenImportKeys] = useToggle();
    const refresh = () => {
        refetchKeyInfo();
        refreshParent();
    };

    const useJwksUrl = useWatch({
        control,
        name: convertAttributeNameToForm<FormFields>("attributes.use.jwks.url"),
        defaultValue: "false"
    });

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
            toast.error(t("generateError", { error: getErrorMessage(error) }), {
                description: getErrorDescription(error)
            });
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
            toast.error(t("importError", { error: getErrorMessage(error) }), {
                description: getErrorDescription(error)
            });
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
