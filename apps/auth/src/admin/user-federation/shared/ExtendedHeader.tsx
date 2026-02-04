import {
    DropdownMenuSeparator,
    DropdownMenuItem
} from "@merge/ui/components/dropdown-menu";
import { useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { useAdminClient } from "../../admin-client";
import { getErrorDescription, getErrorMessage } from "../../../shared/keycloak-ui-shared";
import { toast } from "@merge/ui/components/sonner";
import { useConfirmDialog } from "../../components/confirm-dialog/ConfirmDialog";
import { Header } from "./Header";

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
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
const { control } = useFormContext();
    const hasImportUsers = useWatch({
        name: "config.importEnabled",
        control,
        defaultValue: ["true"]
    })[0];

    const [toggleUnlinkUsersDialog, UnlinkUsersDialog] = useConfirmDialog({
        titleKey: "userFedUnlinkUsersConfirmTitle",
        messageKey: "userFedUnlinkUsersConfirm",
        continueButtonLabel: "unlinkUsers",
        onConfirm: () => unlinkUsers()
    });

    const [toggleRemoveUsersDialog, RemoveUsersConfirm] = useConfirmDialog({
        titleKey: t("removeImportedUsers"),
        messageKey: t("removeImportedUsersMessage"),
        continueButtonLabel: "remove",
        onConfirm: async () => {
            await removeImportedUsers();
        }
    });

    const removeImportedUsers = async () => {
        try {
            if (id) {
                await adminClient.userStorageProvider.removeImportedUsers({ id });
                toast.success(t("removeImportedUsersSuccess"));
            }
        } catch (error) {
            toast.error(t("removeImportedUsersError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
        }
    };

    const syncChangedUsers = async () => {
        try {
            if (id) {
                toast.info(t("syncUsersStarted"));
                const response = await adminClient.userStorageProvider.sync({
                    id: id,
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
            toast.error(t("syncUsersError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
        }
    };

    const syncAllUsers = async () => {
        try {
            if (id) {
                toast.info(t("syncUsersStarted"));
                const response = await adminClient.userStorageProvider.sync({
                    id: id,
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
            toast.error(t("syncUsersError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
        }
    };

    const unlinkUsers = async () => {
        try {
            if (id) {
                await adminClient.userStorageProvider.unlinkUsers({ id });
            }
            toast.success(t("unlinkUsersSuccess"));
        } catch (error) {
            toast.error(t("unlinkUsersError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
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
