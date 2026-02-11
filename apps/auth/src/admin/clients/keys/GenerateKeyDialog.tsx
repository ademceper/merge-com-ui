import type KeyStoreConfig from "@keycloak/keycloak-admin-client/lib/defs/keystoreConfig";
import {
    HelpItem,
    NumberControl,
    SelectField,
    FileUploadControl
} from "../../../shared/keycloak-ui-shared";
import { Button } from "@merge/ui/components/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@merge/ui/components/dialog";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useServerInfo } from "../../context/server-info/ServerInfoProvider";
import { StoreSettings } from "./StoreSettings";

type GenerateKeyDialogProps = {
    clientId: string;
    toggleDialog: () => void;
    save: (keyStoreConfig: KeyStoreConfig) => void;
};

type KeyFormProps = {
    useFile?: boolean;
    isSaml?: boolean;
    hasPem?: boolean;
};

const CERT_PEM = "Certificate PEM" as const;

const extensions = new Map([
    ["PKCS12", "p12"],
    ["JKS", "jks"],
    ["BCFKS", "bcfks"]
]);

type FormFields = KeyStoreConfig & {
    file: string | File;
};

export const getFileExtension = (format: string) => extensions.get(format);

export const KeyForm = ({
    isSaml = false,
    hasPem = false,
    useFile = false
}: KeyFormProps) => {
    const { t } = useTranslation();

    const { watch } = useFormContext<FormFields>();
    const format = watch("format");

    const { cryptoInfo } = useServerInfo();
    const supportedKeystoreTypes = [
        ...(cryptoInfo?.supportedKeystoreTypes ?? []),
        ...(hasPem ? [CERT_PEM] : [])
    ];
    const keySizes = ["4096", "3072", "2048"];

    return (
        <form className="pt-4 space-y-4">
            <SelectField
                name="format"
                label={t("archiveFormat")}
                labelIcon={t("archiveFormatHelp")}
                defaultValue={supportedKeystoreTypes[0]}
                options={supportedKeystoreTypes}
            />
            {useFile && (
                <FileUploadControl
                    label={t("importFile")}
                    labelIcon={
                        <HelpItem
                            helpText={t("importFileHelp")}
                            fieldLabelId="importFile"
                        />
                    }
                    rules={{
                        required: t("required")
                    }}
                    name="file"
                    id="importFile"
                />
            )}
            {format !== CERT_PEM && (
                <StoreSettings hidePassword={useFile} isSaml={isSaml} />
            )}
            {!useFile && (
                <>
                    <SelectField
                        name="keySize"
                        label={t("keySize")}
                        labelIcon={t("keySizeHelp")}
                        defaultValue={keySizes[0]}
                        options={keySizes}
                    />
                    <NumberControl
                        name="validity"
                        label={t("validity")}
                        labelIcon={t("validityHelp")}
                        controller={{
                            defaultValue: 3,
                            rules: { required: t("required"), min: 1, max: 10 }
                        }}
                    />
                </>
            )}
        </form>
    );
};

export const GenerateKeyDialog = ({
    clientId,
    save,
    toggleDialog
}: GenerateKeyDialogProps) => {
    const { t } = useTranslation();
    const form = useForm<KeyStoreConfig>({
        defaultValues: { keyAlias: clientId },
        mode: "onChange"
    });

    const {
        handleSubmit,
        formState: { isValid }
    } = form;

    return (
        <Dialog open onOpenChange={(open) => { if (!open) toggleDialog(); }}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>{t("generateKeys")}</DialogTitle>
                </DialogHeader>
                <p className="text-sm text-muted-foreground">{t("generateKeysDescription")}</p>
                <FormProvider {...form}>
                    <KeyForm />
                </FormProvider>
                <DialogFooter>
                    <Button
                        id="modal-confirm"
                        data-testid="confirm"
                        disabled={!isValid}
                        onClick={async () => {
                            await handleSubmit(config => {
                                save(config);
                                toggleDialog();
                            })();
                        }}
                    >
                        {t("generate")}
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
