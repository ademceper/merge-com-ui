import KeyStoreConfig from "@keycloak/keycloak-admin-client/lib/defs/keystoreConfig";
import { Button } from "@merge/ui/components/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@merge/ui/components/dialog";
import { saveAs } from "file-saver";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useAdminClient } from "../../admin-client";
import { getErrorDescription, getErrorMessage } from "../../../shared/keycloak-ui-shared";
import { toast } from "@merge/ui/components/sonner";
import { useRealm } from "../../context/realm-context/RealmContext";
import { KeyForm, getFileExtension } from "./GenerateKeyDialog";
import { KeyTypes } from "./SamlKeys";

type ExportSamlKeyDialogProps = {
    clientId: string;
    close: () => void;
    keyType: KeyTypes;
};

export const ExportSamlKeyDialog = ({
    clientId,
    close,
    keyType
}: ExportSamlKeyDialogProps) => {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
    const { realm } = useRealm();
const form = useForm<KeyStoreConfig>({
        defaultValues: { realmAlias: realm }
    });

    const download = async (config: KeyStoreConfig) => {
        try {
            const keyStore = await adminClient.clients.downloadKey(
                {
                    id: clientId,
                    attr: keyType
                },
                config
            );
            saveAs(
                new Blob([keyStore], { type: "application/octet-stream" }),
                `keystore.${getFileExtension(config.format ?? "")}`
            );
            toast.success(t("samlKeysExportSuccess"));
            close();
        } catch (error) {
            toast.error(t("samlKeysExportError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
        }
    };

    return (
        <Dialog open onOpenChange={(open) => { if (!open) close(); }}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>{t("exportSamlKeyTitle")}</DialogTitle>
                </DialogHeader>
                <form
                    id="export-saml-key-form"
                    className="pt-4"
                    onSubmit={form.handleSubmit(download)}
                >
                    <FormProvider {...form}>
                        <KeyForm isSaml />
                    </FormProvider>
                </form>
                <DialogFooter>
                    <Button
                        id="modal-confirm"
                        data-testid="confirm"
                        type="submit"
                        form="export-saml-key-form"
                    >
                        {t("export")}
                    </Button>
                    <Button
                        id="modal-cancel"
                        data-testid="cancel"
                        variant="link"
                        onClick={close}
                    >
                        {t("cancel")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
