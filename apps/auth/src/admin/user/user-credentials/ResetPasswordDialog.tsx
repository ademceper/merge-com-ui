/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/user/user-credentials/ResetPasswordDialog.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { RequiredActionAlias } from "@keycloak/keycloak-admin-client/lib/defs/requiredActionProviderRepresentation";
import type UserRepresentation from "@keycloak/keycloak-admin-client/lib/defs/userRepresentation";
import { AlertVariant } from "../../../shared/keycloak-ui-shared";
import { Label } from "@merge/ui/components/label";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { FormErrorText, PasswordInput } from "../../../shared/keycloak-ui-shared";
import { useAdminClient } from "../../admin-client";
import { DefaultSwitchControl } from "../../components/SwitchControl";
import { useAlerts } from "../../../shared/keycloak-ui-shared";
import {
    ConfirmDialogModal,
    useConfirmDialog
} from "../../components/confirm-dialog/ConfirmDialog";
import useToggle from "../../utils/useToggle";

type ResetPasswordDialogProps = {
    user: UserRepresentation;
    isResetPassword: boolean;
    onAddRequiredActions?: (requiredActions: string[]) => void;
    refresh: () => void;
    onClose: () => void;
};

export type CredentialsForm = {
    password: string;
    passwordConfirmation: string;
    temporaryPassword: boolean;
};

const credFormDefaultValues: CredentialsForm = {
    password: "",
    passwordConfirmation: "",
    temporaryPassword: true
};

export const ResetPasswordDialog = ({
    user,
    isResetPassword,
    onAddRequiredActions,
    refresh,
    onClose
}: ResetPasswordDialogProps) => {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
    const form = useForm<CredentialsForm>({
        defaultValues: credFormDefaultValues,
        mode: "onChange"
    });
    const {
        register,
        formState: { isValid, errors },
        watch,
        handleSubmit,
        clearErrors,
        setError
    } = form;

    const [confirm, toggle] = useToggle(true);
    const password = watch("password", "");
    const passwordConfirmation = watch("passwordConfirmation", "");

    const { addAlert, addError } = useAlerts();

    const [toggleConfirmSaveModal, ConfirmSaveModal] = useConfirmDialog({
        titleKey: isResetPassword ? "resetPasswordConfirm" : "setPasswordConfirm",
        messageKey: isResetPassword
            ? t("resetPasswordConfirmText", { username: user.username })
            : t("setPasswordConfirmText", { username: user.username }),
        continueButtonLabel: isResetPassword ? "resetPassword" : "savePassword",
        continueButtonVariant: "destructive",
        onConfirm: () => handleSubmit(saveUserPassword)()
    });

    const saveUserPassword = async ({ password, temporaryPassword }: CredentialsForm) => {
        try {
            await adminClient.users.resetPassword({
                id: user.id!,
                credential: {
                    temporary: temporaryPassword,
                    type: "password",
                    value: password
                }
            });
            if (temporaryPassword) {
                onAddRequiredActions?.([RequiredActionAlias.UPDATE_PASSWORD]);
            }
            const credentials = await adminClient.users.getCredentials({
                id: user.id!
            });
            const credentialLabel = credentials.find(c => c.type === "password");
            const isLocalCredential =
                credentialLabel && credentialLabel.federationLink === undefined;

            if (isLocalCredential) {
                await adminClient.users.updateCredentialLabel(
                    {
                        id: user.id!,
                        credentialId: credentialLabel.id!
                    },
                    t("defaultPasswordLabel")
                );
            }
            addAlert(
                isResetPassword ? t("resetCredentialsSuccess") : t("savePasswordSuccess"),
                AlertVariant.success
            );
            refresh();
        } catch (error) {
            addError(isResetPassword ? "resetPasswordError" : "savePasswordError", error);
        }

        onClose();
    };

    const { onChange, ...rest } = register("password", { required: true });
    return (
        <>
            <ConfirmSaveModal />
            <ConfirmDialogModal
                titleKey={
                    isResetPassword
                        ? t("resetPasswordFor", { username: user.username })
                        : t("setPasswordFor", { username: user.username })
                }
                open={confirm}
                onCancel={onClose}
                toggleDialog={toggle}
                onConfirm={toggleConfirmSaveModal}
                confirmButtonDisabled={!isValid}
                continueButtonLabel="save"
            >
                <form
                    id="userCredentials-form"
                    className="keycloak__user-credentials__reset-form space-y-4"
                >
                    <div className="space-y-2">
                        <Label htmlFor="password">{t("password")} *</Label>
                        <PasswordInput
                            data-testid="passwordField"
                            id="password"
                            onChange={async e => {
                                await onChange(e);
                                if (
                                    e.currentTarget &&
                                    passwordConfirmation !== e.currentTarget.value
                                ) {
                                    setError("passwordConfirmation", {
                                        message: t("confirmPasswordDoesNotMatch")
                                    });
                                } else {
                                    clearErrors("passwordConfirmation");
                                }
                            }}
                            {...rest}
                        />
                        {errors.password && <FormErrorText message={t("required")} />}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="passwordConfirmation">
                            {isResetPassword
                                ? t("resetPasswordConfirmation")
                                : t("passwordConfirmation")} *
                        </Label>
                        <PasswordInput
                            data-testid="passwordConfirmationField"
                            id="passwordConfirmation"
                            {...register("passwordConfirmation", {
                                required: true,
                                validate: value =>
                                    value === password || t("confirmPasswordDoesNotMatch")
                            })}
                        />
                        {errors.passwordConfirmation && (
                            <FormErrorText
                                message={errors.passwordConfirmation.message as string}
                            />
                        )}
                    </div>
                    <FormProvider {...form}>
                        <DefaultSwitchControl
                            name="temporaryPassword"
                            label={t("temporaryPassword")}
                            labelIcon={t("temporaryPasswordHelpText")}
                            className="mb-4"
                            defaultValue="true"
                        />
                    </FormProvider>
                </form>
            </ConfirmDialogModal>
        </>
    );
};
