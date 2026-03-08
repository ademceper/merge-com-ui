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
import { useState } from "react";
import { toast } from "sonner";
import {
    getErrorDescription,
    getErrorMessage,
    KeycloakSpinner
} from "../../../shared/keycloak-ui-shared";
import { convertFormValuesToObject } from "../../shared/lib/util";
import type { ClientScopeDefaultOptionalType } from "../../shared/ui/client-scope/client-scope-types";
import { useClientScope } from "./hooks/use-client-scope";
import { useUpdateClientScope } from "./hooks/use-update-client-scope";
import { ScopeForm } from "./details/scope-form";

type EditClientScopeDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    scopeId: string | null;
    onSuccess?: () => void;
};

const FORM_ID = "edit-client-scope-form";

export function EditClientScopeDialog({
    open,
    onOpenChange,
    scopeId,
    onSuccess
}: EditClientScopeDialogProps) {
    const { t } = useTranslation();
    const [saving, setSaving] = useState(false);

    const { data: clientScope, isLoading: loading } = useClientScope(scopeId ?? "");
    const { mutateAsync: updateScope } = useUpdateClientScope(scopeId ?? "");

    const handleSave = async (formData: ClientScopeDefaultOptionalType) => {
        if (!scopeId || saving) return;
        setSaving(true);
        const payload = convertFormValuesToObject({
            ...formData,
            name: formData.name?.trim().replace(/ /g, "_")
        });
        try {
            await updateScope(payload);
            toast.success(t("updateSuccessClientScope"));
            onOpenChange(false);
            onSuccess?.();
        } catch (error) {
            toast.error(t("updateErrorClientScope", { error: getErrorMessage(error) }), {
                description: getErrorDescription(error)
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg sm:max-w-lg">
                <DialogHeader className="w-full">
                    <div className="flex w-full flex-row items-center justify-between gap-2">
                        <DialogTitle className="min-w-0 flex-1 truncate">
                            {clientScope?.name ?? t("clientScopeDetails")}
                        </DialogTitle>
                    </div>
                </DialogHeader>
                {loading && !clientScope ? (
                    <div className="flex min-h-[200px] items-center justify-center">
                        <KeycloakSpinner />
                    </div>
                ) : clientScope ? (
                    <>
                        <div className="min-h-[200px]">
                            <ScopeForm
                                clientScope={clientScope as ClientScopeDefaultOptionalType}
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
                    </>
                ) : null}
            </DialogContent>
        </Dialog>
    );
}
