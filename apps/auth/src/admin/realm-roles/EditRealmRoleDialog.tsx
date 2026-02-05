import type RoleRepresentation from "@keycloak/keycloak-admin-client/lib/defs/roleRepresentation";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { getErrorDescription, getErrorMessage, KeycloakSpinner } from "../../shared/keycloak-ui-shared";
import { toast } from "@merge/ui/components/sonner";
import { Button } from "@merge/ui/components/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@merge/ui/components/dialog";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAdminClient } from "../admin-client";
import { AttributeForm } from "../components/key-value-form/AttributeForm";
import { RoleForm } from "../components/role-form/RoleForm";

const FORM_ID = "edit-realm-role-form";

type EditRealmRoleDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    roleId: string | null;
    onSuccess?: () => void;
};

export function EditRealmRoleDialog({
    open,
    onOpenChange,
    roleId,
    onSuccess
}: EditRealmRoleDialogProps) {
    const { adminClient } = useAdminClient();
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [role, setRole] = useState<RoleRepresentation | null>(null);

    const form = useForm<AttributeForm>({ mode: "onChange" });

    useEffect(() => {
        if (!open || !roleId) {
            setRole(null);
            return;
        }
        setLoading(true);
        adminClient.roles
            .findOneById({ id: roleId })
            .then((r) => {
                if (!r) throw new Error(t("notFound"));
                setRole(r);
                form.reset({
                    name: r.name,
                    description: r.description ?? ""
                });
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [roleId, open, adminClient, t]);

    const onSubmit: SubmitHandler<AttributeForm> = async (formValues) => {
        if (!roleId) return;
        const payload: RoleRepresentation = {
            ...role,
            name: formValues.name?.trim(),
            description: formValues.description?.trim() || undefined,
            attributes: role?.attributes ?? {}
        };
        try {
            await adminClient.roles.updateById({ id: roleId }, payload);
            toast.success(t("roleSaveSuccess"));
            onOpenChange(false);
            onSuccess?.();
        } catch (error) {
            toast.error(t("roleSaveError", { error: getErrorMessage(error) }), {
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
                            {role?.name ?? t("roleDetails")}
                        </DialogTitle>
                    </div>
                </DialogHeader>
                {loading && !role ? (
                    <div className="flex min-h-[200px] items-center justify-center">
                        <KeycloakSpinner />
                    </div>
                ) : role ? (
                    <div className="min-h-[200px]">
                        <FormProvider {...form}>
                            <RoleForm
                                form={form}
                                onSubmit={onSubmit}
                                role="manage-realm"
                                editMode={true}
                                embedded
                                formId={FORM_ID}
                            />
                        </FormProvider>
                    </div>
                ) : null}
                {role && (
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
