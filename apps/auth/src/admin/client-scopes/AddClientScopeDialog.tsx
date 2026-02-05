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
import {
    ClientScopeDefaultOptionalType,
    changeScope
} from "../components/client-scope/ClientScopeTypes";
import { convertFormValuesToObject } from "../util";
import { ScopeForm } from "./details/ScopeForm";

type AddClientScopeDialogProps = {
    trigger: React.ReactNode;
    onSuccess?: () => void;
};

const FORM_ID = "add-client-scope-form";

export function AddClientScopeDialog({ trigger, onSuccess }: AddClientScopeDialogProps) {
    const { adminClient } = useAdminClient();
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    const handleSave = async (formData: ClientScopeDefaultOptionalType) => {
        if (saving) return;
        setSaving(true);
        const clientScope = convertFormValuesToObject({
            ...formData,
            name: formData.name?.trim().replace(/ /g, "_")
        });
        try {
            await adminClient.clientScopes.create(clientScope);
            const scope = await adminClient.clientScopes.findOneByName({
                name: clientScope.name!
            });
            if (!scope) throw new Error(t("notFound"));
            await changeScope(adminClient, { ...clientScope, id: scope.id }, clientScope.type);
            toast.success(t("createClientScopeSuccess"));
            setOpen(false);
            onSuccess?.();
        } catch (error) {
            toast.error(t("createClientScopeError", { error: getErrorMessage(error) }), {
                description: getErrorDescription(error)
            });
        } finally {
            setSaving(false);
        }
    };

    const handleOpenChange = (next: boolean) => {
        setOpen(next);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="max-w-lg sm:max-w-lg">
                <DialogHeader className="w-full">
                    <div className="flex w-full flex-row items-center justify-between gap-2">
                        <DialogTitle className="min-w-0 flex-1 truncate">
                            {t("createClientScope")}
                        </DialogTitle>
                    </div>
                </DialogHeader>
                <div className="min-h-[200px]">
                    <ScopeForm
                        save={handleSave}
                        formId={FORM_ID}
                        embedded
                    />
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
                            disabled={saving}
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
