import { RequiredActionAlias } from "@keycloak/keycloak-admin-client/lib/defs/requiredActionProviderRepresentation";
import type UserRepresentation from "@keycloak/keycloak-admin-client/lib/defs/userRepresentation";
import { useTranslation } from "@merge-rd/i18n";
import { Label } from "@merge-rd/ui/components/label";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import {
    FormErrorText,
    getErrorDescription,
    getErrorMessage,
    PasswordInput
} from "../../../../shared/keycloak-ui-shared";
import { fetchUserCredentials } from "../../../api/users";
import { useToggle } from "../../../shared/lib/use-toggle";
import { useResetPassword } from "../hooks/use-reset-password";
import { useUpdateCredentialLabel } from "../hooks/use-update-credential-label";
import {
    ConfirmDialogModal,
    useConfirmDialog
} from "../../../shared/ui/confirm-dialog/confirm-dialog";
import { DefaultSwitchControl } from "../../../shared/ui/switch-control";

type ResetPasswordDialogProps = {
    user: UserRepresentation;
    isResetPassword: boolean;
    onAddRequiredActions?: (requiredActions: string[]) => void;
    refresh: () => void;
    onClose: () => void;
};

type CredentialsForm = {
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

    const { mutateAsync: resetPasswordMut } = useResetPassword(user.id!);
    const { mutateAsync: updateLabelMut } = useUpdateCredentialLabel(user.id!);
    const [confirm, toggle] = useToggle(true);
    const password = watch("password", "");
    const passwordConfirmation = watch("passwordConfirmation", "");
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
            await resetPasswordMut({
                temporary: temporaryPassword,
                type: "password",
                value: password
            });
            if (temporaryPassword) {
                onAddRequiredActions?.([RequiredActionAlias.UPDATE_PASSWORD]);
            }
            const credentials = await fetchUserCredentials(user.id!);
            const credentialLabel = credentials.find(c => c.type === "password");
            const isLocalCredential =
                credentialLabel && credentialLabel.federationLink === undefined;

            if (isLocalCredential) {
                await updateLabelMut({
                    credentialId: credentialLabel.id!,
                    label: t("defaultPasswordLabel")
                });
            }
            toast.success(
                isResetPassword ? t("resetCredentialsSuccess") : t("savePasswordSuccess")
            );
            refresh();
        } catch (error) {
            toast.error(
                t(isResetPassword ? "resetPasswordError" : "savePasswordError", {
                    error: getErrorMessage(error)
                }),
                { description: getErrorDescription(error) }
            );
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
                                : t("passwordConfirmation")}{" "}
                            *
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
