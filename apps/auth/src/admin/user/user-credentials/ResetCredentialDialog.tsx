/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/user/user-credentials/ResetCredentialDialog.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import type { RequiredActionAlias } from "@keycloak/keycloak-admin-client/lib/defs/requiredActionProviderRepresentation";
import { AlertVariant } from "../../../shared/keycloak-ui-shared";
import { isEmpty } from "lodash-es";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useAdminClient } from "../../admin-client";
import { useAlerts } from "../../../shared/keycloak-ui-shared";
import { ConfirmDialogModal } from "../../components/confirm-dialog/ConfirmDialog";
import { LifespanField } from "./LifespanField";
import { RequiredActionMultiSelect } from "./RequiredActionMultiSelect";
import { useRealm } from "../../context/realm-context/RealmContext";

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

    const { addAlert, addError } = useAlerts();

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
            addAlert(t("credentialResetEmailSuccess"), AlertVariant.success);
            onClose();
        } catch (error) {
            addError("credentialResetEmailError", error);
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
