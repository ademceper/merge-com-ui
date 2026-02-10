import type GroupRepresentation from "@keycloak/keycloak-admin-client/lib/defs/groupRepresentation";
import { Button } from "@merge/ui/components/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@merge/ui/components/alert-dialog";
import {
    DataTable,
    DataTableRowActions,
    type ColumnDef,
    type Row
} from "@merge/ui/components/table";
import { ArrowsDownUp, CopySimple, PencilSimple, Plus, Trash } from "@phosphor-icons/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { useAdminClient } from "../admin-client";
import { getErrorDescription, getErrorMessage, useFetch } from "../../shared/keycloak-ui-shared";
import { toast } from "@merge/ui/components/sonner";
import { useAccess } from "../context/access/Access";
import { GroupsModal } from "./GroupsModal";
import { useSubGroups } from "./SubGroupsContext";
import { MoveDialog } from "./MoveDialog";
import { getLastId } from "./groupIdUtils";

type GroupTableProps = {
    refresh: () => void;
};

export const GroupTable = ({ refresh: viewRefresh }: GroupTableProps) => {
    const { adminClient } = useAdminClient();
    const { t } = useTranslation();
    const location = useLocation();
    const id = getLastId(location.pathname);
    const { currentGroup } = useSubGroups();
    const { hasAccess } = useAccess();
    const isManager = hasAccess("manage-users") || currentGroup()?.access?.manage;

    const [key, setKey] = useState(0);
    const refresh = () => {
        setKey((k) => k + 1);
        viewRefresh();
    };
    const [groups, setGroups] = useState<GroupRepresentation[]>([]);
    const [groupToDelete, setGroupToDelete] = useState<GroupRepresentation | undefined>();
    const [editGroup, setEditGroup] = useState<GroupRepresentation | undefined>();
    const [createOpen, setCreateOpen] = useState(false);
    const [duplicateId, setDuplicateId] = useState<string | undefined>();
    const [moveGroup, setMoveGroup] = useState<GroupRepresentation | undefined>();
    const [parentIdForCreate, setParentIdForCreate] = useState<string | undefined>();

    useFetch(
        async () => {
            if (id) {
                return adminClient.groups.listSubGroups({
                    parentId: id,
                    first: 0,
                    max: 1000
                });
            }
            return adminClient.groups.find({ first: 0, max: 1000 });
        },
        (data) => setGroups(data),
        [key, id]
    );

    const onDeleteConfirm = async () => {
        if (!groupToDelete?.id) return;
        try {
            await adminClient.groups.del({ id: groupToDelete.id });
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
                    to={`${location.pathname}/${row.original.id}`}
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
                onOpenChange={(open) => !open && setGroupToDelete(undefined)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t("deleteConfirmTitle", { count: 1 })}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("deleteConfirmGroup", {
                                count: 1,
                                groupName: groupToDelete?.name
                            })}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                        <AlertDialogAction
                            variant="destructive"
                            data-testid="confirm"
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
                    onOpenChange={(open) => !open && setEditGroup(undefined)}
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
                    onOpenChange={(open) => {
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
                    onOpenChange={(open) => !open && setDuplicateId(undefined)}
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
                key={`${id}-${key}`}
                columns={columns}
                data={groups}
                searchColumnId="name"
                searchPlaceholder={t("filterGroups")}
                emptyMessage={t(emptyMessageKey)}
                onRowClick={(row) => isManager && setEditGroup(row.original)}
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
