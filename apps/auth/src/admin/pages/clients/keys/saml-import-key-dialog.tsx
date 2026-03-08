import { useTranslation } from "@merge-rd/i18n";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import {
    getErrorDescription,
    getErrorMessage
} from "../../../../shared/keycloak-ui-shared";
import { ConfirmDialogModal } from "../../../shared/ui/confirm-dialog/confirm-dialog";
import { KeyForm } from "./generate-key-dialog";
import type { KeyTypes } from "./saml-keys";
import { type SamlKeysDialogForm, submitForm } from "./saml-keys-dialog";

type SamlImportKeyDialogProps = {
    id: string;
    attr: KeyTypes;
    onClose: () => void;
    onImported: () => void;
};

export const SamlImportKeyDialog = ({
    id,
    attr,
    onClose,
    onImported
}: SamlImportKeyDialogProps) => {

    const { t } = useTranslation();
    const form = useForm<SamlKeysDialogForm>();
    const {
        handleSubmit,
        formState: { isValid }
    } = form;
    const submit = async (form: SamlKeysDialogForm) => {
        await submitForm(form, id, attr, error => {
            if (error) {
                toast.error(t("importError", { error: getErrorMessage(error) }), {
                    description: getErrorDescription(error)
                });
            } else {
                toast.success(t("importSuccess"));
                onImported();
            }
        });
    };

    return (
        <ConfirmDialogModal
            open={true}
            toggleDialog={onClose}
            continueButtonLabel="import"
            titleKey="importKey"
            confirmButtonDisabled={!isValid}
            onConfirm={async () => {
                await handleSubmit(submit)();
            }}
        >
            <FormProvider {...form}>
                <KeyForm useFile hasPem />
            </FormProvider>
        </ConfirmDialogModal>
    );
};
