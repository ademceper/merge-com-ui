import type GroupRepresentation from "@keycloak/keycloak-admin-client/lib/defs/groupRepresentation";

const ButtonVariant = { danger: "destructive" as const };

import { useTranslation } from "@merge-rd/i18n";
import { toast } from "sonner";
import {
    getErrorDescription,
    getErrorMessage
} from "@/shared/keycloak-ui-shared";
import { ConfirmDialogModal } from "@/admin/shared/ui/confirm-dialog/confirm-dialog";
import { useDeleteGroups } from "../hooks/use-delete-groups";

type DeleteConfirmProps = {
    selectedRows: GroupRepresentation[];
    show: boolean;
    toggleDialog: () => void;
    refresh: () => void;
};

export const DeleteGroup = ({
    selectedRows,
    show,
    toggleDialog,
    refresh
}: DeleteConfirmProps) => {

    const { t } = useTranslation();
    const { mutateAsync: deleteGroups } = useDeleteGroups();

    const multiDelete = async () => {
        try {
            await deleteGroups(selectedRows.map(g => g.id!));
            refresh();
            toast.success(t("groupDeleted", { count: selectedRows.length }));
        } catch (error) {
            toast.error(t("groupDeleteError", { error: getErrorMessage(error) }), {
                description: getErrorDescription(error)
            });
        }
    };

    return (
        <ConfirmDialogModal
            titleKey="deleteConfirmTitle"
            titleKeyVariables={{ count: selectedRows.length }}
            messageKey="deleteConfirmGroup"
            messageKeyVariables={{
                count: selectedRows.length,
                groupName: selectedRows[0]?.name
            }}
            continueButtonLabel="delete"
            continueButtonVariant={ButtonVariant.danger}
            onConfirm={multiDelete}
            open={show}
            toggleDialog={toggleDialog}
        />
    );
};
