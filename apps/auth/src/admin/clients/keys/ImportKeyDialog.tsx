import { SelectField, FileUploadControl } from "../../../shared/keycloak-ui-shared";
import { Button } from "@merge/ui/components/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@merge/ui/components/dialog";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useServerInfo } from "../../context/server-info/ServerInfoProvider";
import { StoreSettings } from "./StoreSettings";

type ImportKeyDialogProps = {
    toggleDialog: () => void;
    save: (importFile: ImportFile) => void;
    title?: string;
    description?: string;
};

export type ImportFile = {
    keystoreFormat: string;
    keyAlias: string;
    storePassword: string;
    file: File | string;
};

export const ImportKeyDialog = ({
    save,
    toggleDialog,
    title = "generateKeys",
    description = "generateKeysDescription"
}: ImportKeyDialogProps) => {
    const { t } = useTranslation();
    const form = useForm<ImportFile>();
    const { control, handleSubmit } = form;

    const baseFormats = useServerInfo().cryptoInfo?.supportedKeystoreTypes ?? [];

    const formats = baseFormats.concat([
        "Certificate PEM",
        "Public Key PEM",
        "JSON Web Key Set"
    ]);

    const format = useWatch({
        control,
        name: "keystoreFormat",
        defaultValue: formats[0]
    });

    return (
        <Dialog open onOpenChange={(open) => { if (!open) toggleDialog(); }}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>{t(title)}</DialogTitle>
                </DialogHeader>
                <p className="text-sm text-muted-foreground">{t(description)}</p>
                <form className="pt-4 space-y-4">
                    <FormProvider {...form}>
                        <SelectField
                            name="keystoreFormat"
                            label={t("archiveFormat")}
                            labelIcon={t("archiveFormatHelp")}
                            defaultValue={formats[0]}
                            options={formats}
                        />
                        <FileUploadControl
                            label={t("importFile")}
                            id="importFile"
                            name="file"
                            rules={{
                                required: t("required")
                            }}
                        />
                        {baseFormats.includes(format) && <StoreSettings hidePassword />}
                    </FormProvider>
                </form>
                <DialogFooter>
                    <Button
                        id="modal-confirm"
                        data-testid="confirm"
                        onClick={async () => {
                            await handleSubmit(importFile => {
                                save(importFile);
                                toggleDialog();
                            })();
                        }}
                    >
                        {t("import")}
                    </Button>
                    <Button
                        id="modal-cancel"
                        data-testid="cancel"
                        variant="link"
                        onClick={toggleDialog}
                    >
                        {t("cancel")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
