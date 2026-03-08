import type GroupRepresentation from "@keycloak/keycloak-admin-client/lib/defs/groupRepresentation";
import { Trans, useTranslation } from "@merge-rd/i18n";
import { Button } from "@merge-rd/ui/components/button";
import { Popover, PopoverContent, PopoverTrigger } from "@merge-rd/ui/components/popover";
import { Plus, Question, Trash } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
    type ColumnDef,
    DataTable,
    DataTableRowActions
} from "@/admin/shared/ui/data-table";
import {
    getErrorDescription,
    getErrorMessage,
    KeycloakSpinner,
    useHelp
} from "../../../shared/keycloak-ui-shared";
import { useAccess } from "../../app/providers/access/access";
import { useRealm } from "../../app/providers/realm-context/realm-context";
import useToggle from "../../shared/lib/useToggle";
import { useConfirmDialog } from "../../shared/ui/confirm-dialog/confirm-dialog";
import { GroupPickerDialog } from "../../shared/ui/group/group-picker-dialog";
import { toUserFederation } from "../../shared/lib/routes/user-federation";
import { useAddDefaultGroup } from "./api/use-add-default-group";
import { useDefaultGroups } from "./api/use-default-groups";
import { useRemoveDefaultGroup } from "./api/use-remove-default-group";

export const DefaultGroupsTab = () => {
    const { t } = useTranslation();
    const [isGroupPickerOpen, toggleGroupPicker] = useToggle();
    const [selectedRows, setSelectedRows] = useState<GroupRepresentation[]>([]);
    const { realm } = useRealm();
    const { enabled } = useHelp();
    const { hasAccess } = useAccess();
    const canAddOrRemoveGroups = hasAccess("view-users", "manage-realm");

    const { data: defaultGroups } = useDefaultGroups();
    const addDefaultGroupMutation = useAddDefaultGroup();
    const removeDefaultGroupMutation = useRemoveDefaultGroup();

    const removeGroups = async (groups: GroupRepresentation[]) => {
        try {
            await removeDefaultGroupMutation.mutateAsync(groups);
            toast.success(t("groupRemove", { count: groups.length }));
        } catch (error) {
            toast.error(t("groupRemoveError", { error: getErrorMessage(error) }), {
                description: getErrorDescription(error)
            });
        }
    };

    const addGroups = async (groups: GroupRepresentation[]) => {
        try {
            await addDefaultGroupMutation.mutateAsync(groups);
            toast.success(t("defaultGroupAdded", { count: groups.length }));
        } catch (error) {
            toast.error(t("defaultGroupAddedError", { error: getErrorMessage(error) }), {
                description: getErrorDescription(error)
            });
        }
    };

    const [toggleRemoveDialog, RemoveDialog] = useConfirmDialog({
        titleKey: t("removeConfirmTitle", { count: selectedRows.length }),
        messageKey: t("removeConfirm", { count: selectedRows.length }),
        continueButtonLabel: "delete",
        continueButtonVariant: "destructive",
        onConfirm: async () => {
            await removeGroups(selectedRows);
            setSelectedRows([]);
        }
    });

    const columns: ColumnDef<GroupRepresentation>[] = useMemo(
        () => [
            {
                accessorKey: "name",
                header: t("groupName"),
                cell: ({ row }) => row.original.name ?? "-"
            },
            {
                accessorKey: "path",
                header: t("path"),
                cell: ({ row }) => row.original.path ?? "-"
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
                          )
                      } as ColumnDef<GroupRepresentation>
                  ]
                : [])
        ],
        [t, canAddOrRemoveGroups, toggleRemoveDialog]
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
                        ok: "add"
                    }}
                    onConfirm={async groups => {
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
                                <Link to={toUserFederation({ realm }) as string} />.
                            </Trans>
                        </PopoverContent>
                    </Popover>
                )}
                <DataTable
                    columns={columns}
                    data={defaultGroups}
                    searchColumnId="name"
                    searchPlaceholder={t("searchForGroups")}
                    emptyMessage={t("noDefaultGroups")}
                    onDeleteRows={
                        canAddOrRemoveGroups
                            ? rows => removeGroups(rows.map(r => r.original))
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
                                <span className="hidden sm:inline">{t("addGroups")}</span>
                            </Button>
                        ) : undefined
                    }
                />
            </div>
        </>
    );
};
