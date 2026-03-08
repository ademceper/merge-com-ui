import type UserRepresentation from "@keycloak/keycloak-admin-client/lib/defs/userRepresentation";
import { useTranslation } from "@merge-rd/i18n";
import { Button } from "@merge-rd/ui/components/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@merge-rd/ui/components/dialog";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import {
    getErrorDescription,
    getErrorMessage,
    KeycloakSpinner
} from "../../../shared/keycloak-ui-shared";
import { TextControl } from "../../../shared/keycloak-ui-shared/controls/text-control";
import { findUser, updateUser } from "../../api/users";
import { emailRegexPattern } from "../../shared/lib/util";
import { FormAccess } from "../../shared/ui/form/form-access";

const FORM_ID = "edit-user-form";

type EditUserFormFields = {
    username: string;
    email: string;
    firstName: string;
    lastName: string;
};

type EditUserDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    userId: string | null;
    onSuccess?: () => void;
};

export function EditUserDialog({
    open,
    onOpenChange,
    userId,
    onSuccess
}: EditUserDialogProps) {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<UserRepresentation | null>(null);

    const form = useForm<EditUserFormFields>({ mode: "onChange" });

    useEffect(() => {
        if (!open || !userId) {
            setUser(null);
            return;
        }
        setLoading(true);
        findUser(userId)
            .then(u => {
                if (!u) throw new Error(t("notFound"));
                setUser(u);
                form.reset({
                    username: u.username ?? "",
                    email: u.email ?? "",
                    firstName: u.firstName ?? "",
                    lastName: u.lastName ?? ""
                });
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [userId, open, t]);

    const onSubmit = async (values: EditUserFormFields) => {
        if (!userId) return;
        const payload: UserRepresentation = {
            ...user,
            username: values.username?.trim(),
            email: values.email?.trim() || undefined,
            firstName: values.firstName?.trim() || undefined,
            lastName: values.lastName?.trim() || undefined
        };
        try {
            await updateUser(userId, payload);
            toast.success(t("userSaved"));
            onOpenChange(false);
            onSuccess?.();
        } catch (error) {
            toast.error(t("userNotSaved", { error: getErrorMessage(error) }), {
                description: getErrorDescription(error)
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg sm:max-w-lg">
                <DialogHeader className="w-full">
                    <div className="flex w-full flex-row items-center justify-between gap-2">
                        <DialogTitle className="min-w-0 flex-1 truncate">
                            {user?.username ?? t("userDetails")}
                        </DialogTitle>
                    </div>
                </DialogHeader>
                {loading && !user ? (
                    <div className="flex min-h-[200px] items-center justify-center">
                        <KeycloakSpinner />
                    </div>
                ) : user ? (
                    <div className="min-h-[200px]">
                        <FormProvider {...form}>
                            <FormAccess
                                id={FORM_ID}
                                role="query-users"
                                fineGrainedAccess
                                onSubmit={form.handleSubmit(onSubmit)}
                                className="flex flex-col gap-5 py-2"
                            >
                                <TextControl
                                    name="username"
                                    label={t("username")}
                                    showLabel
                                    isDisabled
                                />
                                <TextControl
                                    name="email"
                                    label={t("email")}
                                    type="email"
                                    showLabel
                                    rules={{
                                        pattern: {
                                            value: emailRegexPattern,
                                            message: t("emailInvalid")
                                        }
                                    }}
                                />
                                <TextControl
                                    name="firstName"
                                    label={t("firstName")}
                                    showLabel
                                />
                                <TextControl
                                    name="lastName"
                                    label={t("lastName")}
                                    showLabel
                                />
                            </FormAccess>
                        </FormProvider>
                    </div>
                ) : null}
                {user && (
                    <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:flex-nowrap sm:items-center sm:justify-end sm:gap-4">
                        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:shrink-0 sm:items-center">
                            <DialogClose asChild>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="h-9 min-h-9 w-full text-foreground sm:w-auto"
                                >
                                    {t("cancel")}
                                </Button>
                            </DialogClose>
                            <Button
                                type="submit"
                                form={FORM_ID}
                                disabled={
                                    !form.formState.isValid ||
                                    !form.formState.isDirty ||
                                    form.formState.isSubmitting ||
                                    form.formState.isLoading ||
                                    form.formState.isValidating
                                }
                                className="h-9 min-h-9 w-full group sm:w-auto"
                            >
                                {t("save")}
                            </Button>
                        </div>
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    );
}
