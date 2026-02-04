import { getErrorDescription, getErrorMessage } from "../../../shared/keycloak-ui-shared";
import { toast } from "@merge/ui/components/sonner";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useAdminClient } from "../../admin-client";
import { ConfirmDialogModal } from "../../components/confirm-dialog/ConfirmDialog";
import { KeyForm } from "./GenerateKeyDialog";
import type { KeyTypes } from "./SamlKeys";
import { SamlKeysDialogForm, submitForm } from "./SamlKeysDialog";

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
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
    const form = useForm<SamlKeysDialogForm>();
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
