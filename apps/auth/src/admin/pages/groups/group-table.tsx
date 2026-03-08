import type GroupRepresentation from "@keycloak/keycloak-admin-client/lib/defs/groupRepresentation";
import { useTranslation } from "@merge-rd/i18n";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@merge-rd/ui/components/alert-dialog";
import { Button } from "@merge-rd/ui/components/button";
import {
    ArrowsDownUp,
    CopySimple,
    PencilSimple,
    Plus,
    Trash
} from "@phosphor-icons/react";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
    type ColumnDef,
    DataTable,
    DataTableRowActions,
    type Row
} from "@/admin/shared/ui/data-table";
import { getErrorDescription, getErrorMessage } from "../../../shared/keycloak-ui-shared";
import { useAccess } from "../../app/providers/access/access";
import { groupKeys } from "./hooks/keys";
import { useDeleteGroups } from "./hooks/use-delete-groups";
import { useGroupsList } from "./hooks/use-groups-list";
import { getLastId } from "./group-id-utils";
import { GroupsModal } from "./groups-modal";
import { MoveDialog } from "./move-dialog";
import { useSubGroups } from "./sub-groups-context";

type GroupTableProps = {
    refresh: () => void;
};

export const GroupTable = ({ refresh: viewRefresh }: GroupTableProps) => {
    const { t } = useTranslation();
    const location = useLocation();
    const id = getLastId(location.pathname);
    const { currentGroup } = useSubGroups();
    const { hasAccess } = useAccess();
    const isManager = hasAccess("manage-users") || currentGroup()?.access?.manage;

    const queryClient = useQueryClient();
    const { data: groups = [] } = useGroupsList(id);
    const { mutateAsync: deleteGroupMutation } = useDeleteGroups();
    const refresh = () => {
        queryClient.invalidateQueries({ queryKey: groupKeys.all });
        viewRefresh();
    };
    const [groupToDelete, setGroupToDelete] = useState<GroupRepresentation | undefined>();
    const [editGroup, setEditGroup] = useState<GroupRepresentation | undefined>();
    const [createOpen, setCreateOpen] = useState(false);
    const [duplicateId, setDuplicateId] = useState<string | undefined>();
    const [moveGroup, setMoveGroup] = useState<GroupRepresentation | undefined>();
    const [parentIdForCreate, setParentIdForCreate] = useState<string | undefined>();

    const onDeleteConfirm = async () => {
        if (!groupToDelete?.id) return;
        try {
            await deleteGroupMutation([groupToDelete.id]);
            toast.success(t("groupDeleted", { count: 1 }));
            setGroupToDelete(undefined);
            refresh();
        } catch (error) {
            toast.error(t("groupDeleteError", { error: getErrorMessage(error) }), {
                description: getErrorDescription(error)
            });
        }
    };

    const openCreate = (parentId?: string) => {
        setParentIdForCreate(parentId ?? id);
        setCreateOpen(true);
    };

    const columns: ColumnDef<GroupRepresentation>[] = [
        {
            accessorKey: "name",
            header: t("groupName"),
            enableHiding: false,
            cell: ({ row }) => (
                <Link
                    to={`${location.pathname}/${row.original.id}` as string}
                    className="text-primary hover:underline"
                >
                    {row.original.name}
                </Link>
            )
        },
        ...(isManager
            ? [
                  {
                      id: "actions",
                      header: "",
                      size: 50,
                      enableHiding: false,
                      cell: ({ row }: { row: Row<GroupRepresentation> }) => (
                          <DataTableRowActions row={row}>
                              <button
                                  type="button"
                                  className="flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                                  onClick={() => setEditGroup(row.original)}
                              >
                                  <PencilSimple className="size-4 shrink-0" />
                                  {t("edit")}
                              </button>
                              <button
                                  type="button"
                                  className="flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                                  onClick={() => setMoveGroup(row.original)}
                              >
                                  <ArrowsDownUp className="size-4 shrink-0" />
                                  {t("moveTo")}
                              </button>
                              <button
                                  type="button"
                                  className="flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                                  onClick={() => openCreate(row.original.id)}
                              >
                                  <Plus className="size-4 shrink-0" />
                                  {t("createChildGroup")}
                              </button>
                              {!id && (
                                  <button
                                      type="button"
                                      className="flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                                      onClick={() => setDuplicateId(row.original.id)}
                                  >
                                      <CopySimple className="size-4 shrink-0" />
                                      {t("duplicate")}
                                  </button>
                              )}
                              <div className="my-1 h-px bg-border" />
                              <button
                                  type="button"
                                  className="flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left text-sm text-destructive hover:bg-destructive/10 hover:text-destructive"
                                  onClick={() => setGroupToDelete(row.original)}
                              >
                                  <Trash className="size-4 shrink-0" />
                                  {t("delete")}
                              </button>
                          </DataTableRowActions>
                      )
                  } as ColumnDef<GroupRepresentation>
              ]
            : [])
    ];

    const emptyMessageKey = id ? `noGroupsInThisSubGroup` : `noGroupsInThisRealm`;

    return (
        <>
            <AlertDialog
                open={!!groupToDelete}
                onOpenChange={open => !open && setGroupToDelete(undefined)}
            >
                <AlertDialogContent className="max-w-lg sm:max-w-lg">
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {t("deleteConfirmTitle", { count: 1 })}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("deleteConfirmGroup", {
                                count: 1,
                                groupName: groupToDelete?.name
                            })}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-4">
                        <AlertDialogCancel className="h-9 min-h-9 w-full sm:w-auto">
                            {t("cancel")}
                        </AlertDialogCancel>
                        <AlertDialogAction
                            variant="destructive"
                            data-testid="confirm"
                            className="h-9 min-h-9 w-full sm:w-auto"
                            onClick={onDeleteConfirm}
                        >
                            {t("delete")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {editGroup && (
                <GroupsModal
                    open={true}
                    onOpenChange={open => !open && setEditGroup(undefined)}
                    id={editGroup.id}
                    rename={editGroup}
                    refresh={() => {
                        setEditGroup(undefined);
                        refresh();
                    }}
                    handleModalToggle={() => setEditGroup(undefined)}
                />
            )}

            {createOpen && (
                <GroupsModal
                    open={true}
                    onOpenChange={open => {
                        if (!open) setCreateOpen(false);
                    }}
                    id={parentIdForCreate ?? id}
                    handleModalToggle={() => setCreateOpen(false)}
                    refresh={() => {
                        setCreateOpen(false);
                        refresh();
                    }}
                />
            )}

            {duplicateId && (
                <GroupsModal
                    open={true}
                    onOpenChange={open => !open && setDuplicateId(undefined)}
                    id={duplicateId}
                    duplicateId={duplicateId}
                    refresh={() => {
                        setDuplicateId(undefined);
                        refresh();
                    }}
                    handleModalToggle={() => setDuplicateId(undefined)}
                />
            )}

            {moveGroup && (
                <MoveDialog
                    source={moveGroup}
                    refresh={() => {
                        setMoveGroup(undefined);
                        refresh();
                    }}
                    onClose={() => setMoveGroup(undefined)}
                />
            )}

            <DataTable
                key={id}
                columns={columns}
                data={groups}
                searchColumnId="name"
                searchPlaceholder={t("filterGroups")}
                emptyMessage={t(emptyMessageKey)}
                onRowClick={row => isManager && setEditGroup(row.original)}
                toolbar={
                    isManager ? (
                        <Button
                            type="button"
                            data-testid="createGroup"
                            variant="default"
                            className="flex h-9 w-9 shrink-0 items-center justify-center p-0 sm:h-9 sm:w-auto sm:gap-2 sm:px-4 sm:py-2"
                            aria-label={t("createGroup")}
                            onClick={() => openCreate()}
                        >
                            <Plus size={20} className="shrink-0 sm:hidden" />
                            <span className="hidden sm:inline">{t("createGroup")}</span>
                        </Button>
                    ) : undefined
                }
            />
        </>
    );
};
