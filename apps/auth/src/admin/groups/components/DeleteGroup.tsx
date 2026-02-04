import type GroupRepresentation from "@keycloak/keycloak-admin-client/lib/defs/groupRepresentation";
const ButtonVariant = { danger: "destructive" as const };
import { useTranslation } from "react-i18next";
import { useAdminClient } from "../../admin-client";
import { getErrorDescription, getErrorMessage } from "../../../shared/keycloak-ui-shared";
import { toast } from "@merge/ui/components/sonner";
import { ConfirmDialogModal } from "../../components/confirm-dialog/ConfirmDialog";

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
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
const multiDelete = async () => {
        try {
            for (const group of selectedRows) {
                await adminClient.groups.del({
                    id: group.id!
                });
            }
            refresh();
            toast.success(t("groupDeleted", { count: selectedRows.length }));
        } catch (error) {
            toast.error(t("groupDeleteError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
        }
    };

    return (
        <ConfirmDialogModal
            titleKey={t("deleteConfirmTitle", { count: selectedRows.length })}
            messageKey={t("deleteConfirmGroup", {
                count: selectedRows.length,
                groupName: selectedRows[0]?.name
            })}
            continueButtonLabel="delete"
            continueButtonVariant={ButtonVariant.danger}
            onConfirm={multiDelete}
            open={show}
            toggleDialog={toggleDialog}
        />
    );
};
