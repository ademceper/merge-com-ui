import type ScopeRepresentation from "@keycloak/keycloak-admin-client/lib/defs/scopeRepresentation";
import { Alert, AlertTitle, AlertDescription } from "@merge-rd/ui/components/alert";
import { useTranslation } from "@merge-rd/i18n";
import { useAdminClient } from "../../../app/admin-client";
import { getErrorDescription, getErrorMessage } from "../../../../shared/keycloak-ui-shared";
import { toast } from "sonner";
import { ConfirmDialogModal } from "../../../shared/ui/confirm-dialog/confirm-dialog";
import type { PermissionScopeRepresentation } from "./scopes";

type DeleteScopeDialogProps = {
    clientId: string;
    selectedScope: PermissionScopeRepresentation | ScopeRepresentation | undefined;
    refresh: () => void;
    open: boolean;
    toggleDialog: () => void;
};

export const DeleteScopeDialog = ({
    clientId,
    selectedScope,
    refresh,
    open,
    toggleDialog
}: DeleteScopeDialogProps) => {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
return (
        <ConfirmDialogModal
            open={open}
            toggleDialog={toggleDialog}
            titleKey="deleteScope"
            continueButtonLabel="confirm"
            onConfirm={async () => {
                try {
                    await adminClient.clients.delAuthorizationScope({
                        id: clientId,
                        scopeId: selectedScope?.id!
                    });
                    toast.success(t("resourceScopeSuccess"));
                    refresh();
                } catch (error) {
                    toast.error(t("resourceScopeError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
                }
            }}
        >
            {t("deleteScopeConfirm")}
            {selectedScope &&
                "permissions" in selectedScope &&
                selectedScope.permissions &&
                selectedScope.permissions.length > 0 && (
                    <Alert className="mt-4 border-amber-500/50 bg-amber-500/10">
                        <AlertTitle>{t("deleteScopeWarning")}</AlertTitle>
                        <AlertDescription>
                            <p className="pt-1">
                                {selectedScope.permissions.map(permission => (
                                    <strong key={permission.id} className="pr-2">
                                        {permission.name}
                                    </strong>
                                ))}
                            </p>
                        </AlertDescription>
                    </Alert>
                )}
        </ConfirmDialogModal>
    );
};
