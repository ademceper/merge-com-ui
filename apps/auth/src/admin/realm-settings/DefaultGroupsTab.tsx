import type GroupRepresentation from "@keycloak/keycloak-admin-client/lib/defs/groupRepresentation";
import {
    getErrorDescription,
    getErrorMessage,
    useFetch,
    useHelp,
} from "../../shared/keycloak-ui-shared";
import { toast } from "@merge/ui/components/sonner";
import { Button } from "@merge/ui/components/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@merge/ui/components/popover";
import {
    DataTable,
    DataTableRowActions,
    type ColumnDef,
} from "@merge/ui/components/table";
import { Plus, Question, Trash } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useAdminClient } from "../admin-client";
import { useConfirmDialog } from "../components/confirm-dialog/ConfirmDialog";
import { GroupPickerDialog } from "../components/group/GroupPickerDialog";
import { KeycloakSpinner } from "../../shared/keycloak-ui-shared";
import { useRealm } from "../context/realm-context/RealmContext";
import { toUserFederation } from "../user-federation/routes/UserFederation";
import useToggle from "../utils/useToggle";
import { useAccess } from "../context/access/Access";

export const DefaultGroupsTab = () => {
    const { adminClient } = useAdminClient();
    const { t } = useTranslation();
    const [isGroupPickerOpen, toggleGroupPicker] = useToggle();
    const [defaultGroups, setDefaultGroups] = useState<GroupRepresentation[]>();
    const [selectedRows, setSelectedRows] = useState<GroupRepresentation[]>([]);
    const [key, setKey] = useState(0);
    const [load, setLoad] = useState(0);
    const reload = () => setLoad(load + 1);
    const { realm } = useRealm();
    const { enabled } = useHelp();
    const { hasAccess } = useAccess();
    const canAddOrRemoveGroups = hasAccess("view-users", "manage-realm");

    useFetch(
        () => adminClient.realms.getDefaultGroups({ realm }),
        (groups) => {
            setDefaultGroups(groups);
            setKey((k) => k + 1);
        },
        [load],
    );

    const removeGroups = async (groups: GroupRepresentation[]) => {
        try {
            await Promise.all(
                groups.map((group) =>
                    adminClient.realms.removeDefaultGroup({
                        realm,
                        id: group.id!,
                    }),
                ),
            );
            toast.success(t("groupRemove", { count: groups.length }));
        } catch (error) {
            toast.error(
                t("groupRemoveError", { error: getErrorMessage(error) }),
                { description: getErrorDescription(error) },
            );
        }
        reload();
    };

    const addGroups = async (groups: GroupRepresentation[]) => {
        try {
            await Promise.all(
                groups.map((group) =>
                    adminClient.realms.addDefaultGroup({
                        realm,
                        id: group.id!,
                    }),
                ),
            );
            toast.success(t("defaultGroupAdded", { count: groups.length }));
        } catch (error) {
            toast.error(
                t("defaultGroupAddedError", { error: getErrorMessage(error) }),
                { description: getErrorDescription(error) },
            );
        }
        reload();
    };

    const [toggleRemoveDialog, RemoveDialog] = useConfirmDialog({
        titleKey: t("removeConfirmTitle", { count: selectedRows.length }),
        messageKey: t("removeConfirm", { count: selectedRows.length }),
        continueButtonLabel: "delete",
        continueButtonVariant: "destructive",
        onConfirm: async () => {
            await removeGroups(selectedRows);
            setSelectedRows([]);
        },
    });

    const columns: ColumnDef<GroupRepresentation>[] = useMemo(
        () => [
            {
                accessorKey: "name",
                header: t("groupName"),
                cell: ({ row }) => row.original.name ?? "-",
            },
            {
                accessorKey: "path",
                header: t("path"),
                cell: ({ row }) => row.original.path ?? "-",
            },
            ...(canAddOrRemoveGroups
                ? [
                      {
                          id: "actions",
                          header: "",
                          size: 50,
                          enableHiding: false,
                          cell: ({ row }) => (
                              <DataTableRowActions row={row}>
                                  <button
                                      type="button"
                                      className="flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left text-sm text-destructive hover:bg-destructive/10 hover:text-destructive"
                                      onClick={() => {
                                          setSelectedRows([row.original]);
                                          toggleRemoveDialog();
                                      }}
                                  >
                                      <Trash className="size-4 shrink-0" />
                                      {t("remove")}
                                  </button>
                              </DataTableRowActions>
                          ),
                      } as ColumnDef<GroupRepresentation>,
                  ]
                : []),
        ],
        [t, canAddOrRemoveGroups, toggleRemoveDialog],
    );

    if (!defaultGroups) {
        return <KeycloakSpinner />;
    }

    return (
        <>
            <RemoveDialog />
            {isGroupPickerOpen && (
                <GroupPickerDialog
                    type="selectMany"
                    text={{
                        title: "addDefaultGroups",
                        ok: "add",
                    }}
                    onConfirm={async (groups) => {
                        await addGroups(groups || []);
                        toggleGroupPicker();
                    }}
                    onClose={toggleGroupPicker}
                />
            )}
            <div className="space-y-4">
                {enabled && (
                    <Popover>
                        <PopoverTrigger asChild>
                            <p className="cursor-pointer text-sm text-muted-foreground">
                                <Question className="mr-1 inline size-4" />{" "}
                                {t("whatIsDefaultGroups")}
                            </p>
                        </PopoverTrigger>
                        <PopoverContent>
                            <Trans i18nKey="defaultGroupsHelp">
                                {" "}
                                <Link to={toUserFederation({ realm })} />.
                            </Trans>
                        </PopoverContent>
                    </Popover>
                )}
                <DataTable
                    key={key}
                    columns={columns}
                    data={defaultGroups}
                    searchColumnId="name"
                    searchPlaceholder={t("searchForGroups")}
                    emptyMessage={t("noDefaultGroups")}
                    onDeleteRows={
                        canAddOrRemoveGroups
                            ? (rows) =>
                                  removeGroups(rows.map((r) => r.original))
                            : undefined
                    }
                    toolbar={
                        canAddOrRemoveGroups ? (
                            <Button
                                data-testid="openCreateGroupModal"
                                variant="default"
                                className="flex h-9 w-9 shrink-0 items-center justify-center p-0 sm:h-9 sm:w-auto sm:gap-2 sm:px-4 sm:py-2"
                                onClick={toggleGroupPicker}
                            >
                                <Plus size={20} className="shrink-0 sm:hidden" />
                                <span className="hidden sm:inline">
                                    {t("addGroups")}
                                </span>
                            </Button>
                        ) : undefined
                    }
                />
            </div>
        </>
    );
};
