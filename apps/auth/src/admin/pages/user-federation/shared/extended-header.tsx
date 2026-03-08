import { useTranslation } from "@merge-rd/i18n";
import {
    DropdownMenuItem,
    DropdownMenuSeparator
} from "@merge-rd/ui/components/dropdown-menu";
import { useFormContext, useWatch } from "react-hook-form";
import { toast } from "sonner";
import {
    getErrorDescription,
    getErrorMessage
} from "../../../../shared/keycloak-ui-shared";
import { useParams } from "../../../shared/lib/use-params";
import { useRemoveImportedUsers } from "../hooks/use-remove-imported-users";
import { useSyncUsers } from "../hooks/use-sync-users";
import { useUnlinkUsers } from "../hooks/use-unlink-users";
import { useConfirmDialog } from "../../../shared/ui/confirm-dialog/confirm-dialog";
import { Header } from "./header";

type ExtendedHeaderProps = {
    provider: string;
    editMode?: string | string[];
    save: () => void;
    noDivider?: boolean;
};

export const ExtendedHeader = ({
    provider,
    editMode,
    save,
    noDivider = false
}: ExtendedHeaderProps) => {

    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const { control } = useFormContext();
    const hasImportUsers = useWatch({
        name: "config.importEnabled",
        control,
        defaultValue: ["true"]
    })[0];

    const { mutateAsync: removeImportedUsersMut } = useRemoveImportedUsers();
    const { mutateAsync: syncUsersMut } = useSyncUsers();
    const { mutateAsync: unlinkUsersMut } = useUnlinkUsers();

    const [toggleUnlinkUsersDialog, UnlinkUsersDialog] = useConfirmDialog({
        titleKey: "userFedUnlinkUsersConfirmTitle",
        messageKey: "userFedUnlinkUsersConfirm",
        continueButtonLabel: "unlinkUsers",
        onConfirm: () => handleUnlinkUsers()
    });

    const [toggleRemoveUsersDialog, RemoveUsersConfirm] = useConfirmDialog({
        titleKey: t("removeImportedUsers"),
        messageKey: t("removeImportedUsersMessage"),
        continueButtonLabel: "remove",
        onConfirm: async () => {
            await handleRemoveImportedUsers();
        }
    });

    const handleRemoveImportedUsers = async () => {
        try {
            if (id) {
                await removeImportedUsersMut(id);
                toast.success(t("removeImportedUsersSuccess"));
            }
        } catch (error) {
            toast.error(
                t("removeImportedUsersError", { error: getErrorMessage(error) }),
                { description: getErrorDescription(error) }
            );
        }
    };

    const syncChangedUsers = async () => {
        try {
            if (id) {
                toast.info(t("syncUsersStarted"));
                const response = await syncUsersMut({
                    id,
                    action: "triggerChangedUsersSync"
                });
                if (response.ignored) {
                    toast.warning(`${response.status}.`);
                } else {
                    toast.success(
                        t("syncUsersSuccess") +
                            `${response.added} users added, ${response.updated} users updated, ${response.removed} users removed, ${response.failed} users failed.`
                    );
                }
            }
        } catch (error) {
            toast.error(t("syncUsersError", { error: getErrorMessage(error) }), {
                description: getErrorDescription(error)
            });
        }
    };

    const syncAllUsers = async () => {
        try {
            if (id) {
                toast.info(t("syncUsersStarted"));
                const response = await syncUsersMut({
                    id,
                    action: "triggerFullSync"
                });
                if (response.ignored) {
                    toast.warning(`${response.status}.`);
                } else {
                    toast.success(
                        t("syncUsersSuccess") +
                            `${response.added} users added, ${response.updated} users updated, ${response.removed} users removed, ${response.failed} users failed.`
                    );
                }
            }
        } catch (error) {
            toast.error(t("syncUsersError", { error: getErrorMessage(error) }), {
                description: getErrorDescription(error)
            });
        }
    };

    const handleUnlinkUsers = async () => {
        try {
            if (id) {
                await unlinkUsersMut(id);
            }
            toast.success(t("unlinkUsersSuccess"));
        } catch (error) {
            toast.error(t("unlinkUsersError", { error: getErrorMessage(error) }), {
                description: getErrorDescription(error)
            });
        }
    };

    return (
        <>
            <UnlinkUsersDialog />
            <RemoveUsersConfirm />
            <Header
                provider={provider}
                noDivider={noDivider}
                save={save}
                dropdownItems={[
                    <DropdownMenuItem
                        key="sync"
                        onClick={syncChangedUsers}
                        disabled={hasImportUsers === "false"}
                    >
                        {t("syncChangedUsers")}
                    </DropdownMenuItem>,
                    <DropdownMenuItem
                        key="syncall"
                        onClick={syncAllUsers}
                        disabled={hasImportUsers === "false"}
                    >
                        {t("syncAllUsers")}
                    </DropdownMenuItem>,
                    <DropdownMenuItem
                        key="unlink"
                        disabled={editMode ? editMode.includes("UNSYNCED") : false}
                        onClick={toggleUnlinkUsersDialog}
                    >
                        {t("unlinkUsers")}
                    </DropdownMenuItem>,
                    <DropdownMenuItem key="remove" onClick={toggleRemoveUsersDialog}>
                        {t("removeImported")}
                    </DropdownMenuItem>,
                    <DropdownMenuSeparator key="separator" />
                ]}
            />
        </>
    );
};
