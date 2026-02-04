import KeycloakAdminClient from "@keycloak/keycloak-admin-client";
import type CertificateRepresentation from "@keycloak/keycloak-admin-client/lib/defs/certificateRepresentation";
import type KeyStoreConfig from "@keycloak/keycloak-admin-client/lib/defs/keystoreConfig";
import { Button } from "@merge/ui/components/button";
import { Label } from "@merge/ui/components/label";
import { RadioGroup, RadioGroupItem } from "@merge/ui/components/radio-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@merge/ui/components/dialog";
import { saveAs } from "file-saver";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { HelpItem } from "../../../shared/keycloak-ui-shared";
import { useAdminClient } from "../../admin-client";
import { getErrorDescription, getErrorMessage } from "../../../shared/keycloak-ui-shared";
import { toast } from "@merge/ui/components/sonner";
import { Certificate } from "./Certificate";
import { KeyForm } from "./GenerateKeyDialog";
import type { KeyTypes } from "./SamlKeys";

type SamlKeysDialogProps = {
    id: string;
    attr: KeyTypes;
    localeKey: string;
    onClose: () => void;
    onCancel: () => void;
};

export type SamlKeysDialogForm = KeyStoreConfig & {
    file: File;
};

export const submitForm = async (
    adminClient: KeycloakAdminClient,
    form: SamlKeysDialogForm,
    id: string,
    attr: KeyTypes,
    callback: (error?: unknown) => void
) => {
    try {
        const formData = new FormData();
        const { file, ...rest } = form;
        Object.entries(rest).map(([key, value]) =>
            formData.append(key === "format" ? "keystoreFormat" : key, value.toString())
        );
        formData.append("file", file);

        await adminClient.clients.uploadKey({ id, attr }, formData);
        callback();
    } catch (error) {
        callback(error);
    }
};

export const SamlKeysDialog = ({
    id,
    attr,
    localeKey,
    onClose,
    onCancel
}: SamlKeysDialogProps) => {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
    const [type, setType] = useState(false);
    const [keys, setKeys] = useState<CertificateRepresentation>();
    const form = useForm<SamlKeysDialogForm>({ mode: "onChange" });
    const {
        handleSubmit,
        formState: { isValid }
    } = form;
const submit = async (form: SamlKeysDialogForm) => {
        await submitForm(adminClient, form, id, attr, error => {
            if (error) {
                toast.error(t("importError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
            } else {
                toast.success(t("importSuccess"));
            }
        });
    };

    const generate = async () => {
        try {
            const key = await adminClient.clients.generateKey({
                id,
                attr
            });
            setKeys(key);
            saveAs(
                new Blob([key.privateKey!], {
                    type: "application/octet-stream"
                }),
                "private.key"
            );

            toast.success(t("generateSuccess"));
        } catch (error) {
            toast.error(t("generateError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
        }
    };

    return (
        <Dialog open={true} onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>
                        {t("enableClientSignatureRequired", {
                            key: t(localeKey)
                        })}
                    </DialogTitle>
                    <p className="text-sm text-muted-foreground">
                        {t("enableClientSignatureRequiredExplain", {
                            key: t(localeKey)
                        })}
                    </p>
                </DialogHeader>
                <FormProvider {...form}>
                    <form className="space-y-4">
                        <div className="space-y-2">
                            <Label>{t("selectMethod")}</Label>
                            <RadioGroup
                                value={type ? "import" : "generate"}
                                onValueChange={(v) => setType(v === "import")}
                                className="flex gap-4"
                            >
                                <div className="flex items-center gap-2">
                                    <RadioGroupItem value="generate" id="selectMethodType-generate" />
                                    <Label htmlFor="selectMethodType-generate">{t("selectMethodType.generate")}</Label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <RadioGroupItem value="import" id="selectMethodType-import" />
                                    <Label htmlFor="selectMethodType-import">{t("selectMethodType.import")}</Label>
                                </div>
                            </RadioGroup>
                        </div>
                        {!type && (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Label>{t("certificate")}</Label>
                                    <HelpItem
                                        helpText={t(`saml${localeKey}CertificateHelp`)}
                                        fieldLabelId="certificate"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <div className="flex-1">
                                        <Certificate plain keyInfo={keys} />
                                    </div>
                                    <Button
                                        variant="secondary"
                                        data-testid="generate"
                                        onClick={generate}
                                    >
                                        {t("generate")}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </form>
                    {type && <KeyForm useFile hasPem />}
                </FormProvider>
                <DialogFooter>
                    <Button
                        id="modal-confirm"
                        data-testid="confirm"
                        disabled={!isValid && !keys}
                        onClick={async () => {
                            if (type) {
                                await handleSubmit(submit)();
                            }
                            onClose();
                        }}
                    >
                        {t("confirm")}
                    </Button>
                    <Button
                        id="modal-cancel"
                        data-testid="cancel"
                        variant="link"
                        onClick={onCancel}
                    >
                        {t("cancel")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
