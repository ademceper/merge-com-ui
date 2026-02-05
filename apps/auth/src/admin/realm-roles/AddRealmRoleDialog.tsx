import type RoleRepresentation from "@keycloak/keycloak-admin-client/lib/defs/roleRepresentation";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
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
import { AttributeForm } from "../components/key-value-form/AttributeForm";
import { RoleForm } from "../components/role-form/RoleForm";

const FORM_ID = "add-realm-role-form";

type AddRealmRoleDialogProps = {
    trigger: React.ReactNode;
    onSuccess?: () => void;
};

export function AddRealmRoleDialog({ trigger, onSuccess }: AddRealmRoleDialogProps) {
    const { adminClient } = useAdminClient();
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);

    const form = useForm<AttributeForm>({ mode: "onChange" });

    const onSubmit: SubmitHandler<AttributeForm> = async (formValues) => {
        const role: RoleRepresentation = {
            ...formValues,
            name: formValues.name?.trim(),
            attributes: {}
        };
        try {
            await adminClient.roles.create(role);
            toast.success(t("roleCreated"));
            setOpen(false);
            form.reset();
            onSuccess?.();
        } catch (error) {
            toast.error(t("roleCreateError", { error: getErrorMessage(error) }), {
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
                            {t("createRole")}
                        </DialogTitle>
                    </div>
                </DialogHeader>
                <div className="min-h-[200px]">
                    <FormProvider {...form}>
                    <RoleForm
                        form={form}
                        onSubmit={onSubmit}
                        role="manage-realm"
                        editMode={false}
                        embedded
                        formId={FORM_ID}
                    />
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
