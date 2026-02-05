import type ClientScopeRepresentation from "@keycloak/keycloak-admin-client/lib/defs/clientScopeRepresentation";
import { getErrorDescription, getErrorMessage } from "../../shared/keycloak-ui-shared";
import { KeycloakSpinner } from "../../shared/keycloak-ui-shared";
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
import {
    AllClientScopes,
    ClientScope,
    ClientScopeDefaultOptionalType,
    changeScope
} from "../components/client-scope/ClientScopeTypes";
import { convertFormValuesToObject } from "../util";
import { ScopeForm } from "./details/ScopeForm";

type EditClientScopeDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    scopeId: string | null;
    onSuccess?: () => void;
};

const FORM_ID = "edit-client-scope-form";

async function determineScopeType(
    adminClient: ReturnType<typeof useAdminClient>["adminClient"],
    clientScope: ClientScopeRepresentation
) {
    const defaultScopes = await adminClient.clientScopes.listDefaultClientScopes();
    if (defaultScopes.find((s) => s.name === clientScope.name)) return ClientScope.default;
    const optionalScopes = await adminClient.clientScopes.listDefaultOptionalClientScopes();
    return optionalScopes.find((s) => s.name === clientScope.name)
        ? ClientScope.optional
        : AllClientScopes.none;
}

export function EditClientScopeDialog({
    open,
    onOpenChange,
    scopeId,
    onSuccess
}: EditClientScopeDialogProps) {
    const { adminClient } = useAdminClient();
    const { t } = useTranslation();
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(false);
    const [clientScope, setClientScope] = useState<ClientScopeDefaultOptionalType | null>(null);

    useEffect(() => {
        if (!open || !scopeId) {
            setClientScope(null);
            return;
        }
        setLoading(true);
        adminClient.clientScopes
            .findOne({ id: scopeId })
            .then(async (scope) => {
                if (!scope) throw new Error(t("notFound"));
                const type = await determineScopeType(adminClient, scope);
                setClientScope({ ...scope, type } as ClientScopeDefaultOptionalType);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [scopeId, open, adminClient, t]);

    const handleSave = async (formData: ClientScopeDefaultOptionalType) => {
        if (!scopeId || saving) return;
        setSaving(true);
        const payload = convertFormValuesToObject({
            ...formData,
            name: formData.name?.trim().replace(/ /g, "_")
        });
        try {
            await adminClient.clientScopes.update({ id: scopeId }, payload);
            await changeScope(adminClient, { ...payload, id: scopeId }, payload.type);
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
                                clientScope={clientScope}
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
