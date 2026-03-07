import type { RequiredActionAlias } from "@keycloak/keycloak-admin-client/lib/defs/requiredActionProviderRepresentation";
import { isEmpty } from "lodash-es";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { useTranslation } from "@merge-rd/i18n";
import { useAdminClient } from "../../../app/admin-client";
import { getErrorDescription, getErrorMessage } from "../../../../shared/keycloak-ui-shared";
import { toast } from "sonner";
import { ConfirmDialogModal } from "../../../shared/ui/confirm-dialog/confirm-dialog";
import { LifespanField } from "./lifespan-field";
import { RequiredActionMultiSelect } from "./required-action-multi-select";
import { useRealm } from "../../../app/providers/realm-context/realm-context";

type ResetCredentialDialogProps = {
    userId: string;
    onClose: () => void;
};

type CredentialResetForm = {
    actions: RequiredActionAlias[];
    lifespan: number | undefined;
};

export const ResetCredentialDialog = ({
    userId,
    onClose
}: ResetCredentialDialogProps) => {
    const { adminClient } = useAdminClient();
    const { realmRepresentation: realm } = useRealm();
    const { t } = useTranslation();
    const form = useForm<CredentialResetForm>({
        defaultValues: {
            actions: [],
            lifespan: realm?.actionTokenGeneratedByAdminLifespan
        }
    });
    const { handleSubmit, control } = form;

    const resetActionWatcher = useWatch({
        control,
        name: "actions"
    });
    const resetIsNotDisabled = !isEmpty(resetActionWatcher);
const sendCredentialsResetEmail = async ({
        actions,
        lifespan
    }: CredentialResetForm) => {
        if (isEmpty(actions)) {
            return;
        }

        try {
            await adminClient.users.executeActionsEmail({
                id: userId,
                actions,
                lifespan
            });
            toast.success(t("credentialResetEmailSuccess"));
            onClose();
        } catch (error) {
            toast.error(t("credentialResetEmailError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
        }
    };

    return (
        <ConfirmDialogModal
            titleKey="credentialReset"
            open
            onCancel={onClose}
            toggleDialog={onClose}
            continueButtonLabel="credentialResetConfirm"
            onConfirm={async () => {
                await handleSubmit(sendCredentialsResetEmail)();
            }}
            confirmButtonDisabled={!resetIsNotDisabled}
        >
            <form
                id="userCredentialsReset-form"
                className="flex flex-col gap-4"
                data-testid="credential-reset-modal"
            >
                <FormProvider {...form}>
                    <RequiredActionMultiSelect
                        name="actions"
                        label="resetAction"
                        help="resetActions"
                    />
                    <LifespanField />
                </FormProvider>
            </form>
        </ConfirmDialogModal>
    );
};
