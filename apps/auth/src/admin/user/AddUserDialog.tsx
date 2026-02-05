import type UserRepresentation from "@keycloak/keycloak-admin-client/lib/defs/userRepresentation";
import { FormProvider, useForm } from "react-hook-form";
import { getErrorDescription, getErrorMessage } from "../../shared/keycloak-ui-shared";
import { toast } from "@merge/ui/components/sonner";
import { Button } from "@merge/ui/components/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@merge/ui/components/dialog";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAdminClient } from "../admin-client";
import { TextControl } from "../../shared/keycloak-ui-shared/controls/TextControl";
import { emailRegexPattern } from "../util";
import { FormAccess } from "../components/form/FormAccess";

const FORM_ID = "add-user-form";

type AddUserFormFields = {
    username: string;
    email: string;
    firstName: string;
    lastName: string;
};

type AddUserDialogProps = {
    trigger: React.ReactNode;
    onSuccess?: () => void;
};

export function AddUserDialog({ trigger, onSuccess }: AddUserDialogProps) {
    const { adminClient } = useAdminClient();
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);

    const form = useForm<AddUserFormFields>({ mode: "onChange" });

    const onSubmit = async (values: AddUserFormFields) => {
        const user: UserRepresentation = {
            username: values.username?.trim(),
            email: values.email?.trim() || undefined,
            firstName: values.firstName?.trim() || undefined,
            lastName: values.lastName?.trim() || undefined,
            enabled: true
        };
        try {
            await adminClient.users.create(user);
            toast.success(t("userCreated"));
            setOpen(false);
            form.reset();
            onSuccess?.();
        } catch (error) {
            toast.error(t("userCreateError", { error: getErrorMessage(error) }), {
                description: getErrorDescription(error)
            });
        }
    };

    const handleOpenChange = (next: boolean) => {
        setOpen(next);
        if (!next) form.reset();
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="max-w-lg sm:max-w-lg">
                <DialogHeader className="w-full">
                    <div className="flex w-full flex-row items-center justify-between gap-2">
                        <DialogTitle className="min-w-0 flex-1 truncate">
                            {t("createUser")}
                        </DialogTitle>
                    </div>
                </DialogHeader>
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
                                rules={{ required: t("required") }}
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
                            <TextControl name="firstName" label={t("firstName")} showLabel />
                            <TextControl name="lastName" label={t("lastName")} showLabel />
                        </FormAccess>
                    </FormProvider>
                </div>
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
            </DialogContent>
        </Dialog>
    );
}
