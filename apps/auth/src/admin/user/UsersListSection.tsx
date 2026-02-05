import type UserRepresentation from "@keycloak/keycloak-admin-client/lib/defs/userRepresentation";
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
    type ColumnDef
} from "@merge/ui/components/table";
import { PencilSimple, Plus, Trash } from "@phosphor-icons/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useAdminClient } from "../admin-client";
import { getErrorDescription, getErrorMessage, useFetch } from "../../shared/keycloak-ui-shared";
import { toast } from "@merge/ui/components/sonner";
import { useAccess } from "../context/access/Access";
import { useRealm } from "../context/realm-context/RealmContext";
import { emptyFormatter } from "../util";
import { toUser } from "./routes/User";
import { AddUserDialog } from "./AddUserDialog";
import { EditUserDialog } from "./EditUserDialog";

export function UsersListSection() {
    const { adminClient } = useAdminClient();
    const { t } = useTranslation();
    const { realm } = useRealm();
    const { hasAccess } = useAccess();
    const canManage = hasAccess("manage-users");

    const [key, setKey] = useState(0);
    const refresh = () => setKey((k) => k + 1);
    const [users, setUsers] = useState<UserRepresentation[]>([]);
    const [selectedUser, setSelectedUser] = useState<UserRepresentation | undefined>();
    const [editUserId, setEditUserId] = useState<string | null>(null);

    useFetch(
        async () => adminClient.users.find({ first: 0, max: 1000 }),
        (data) => setUsers(data),
        [key]
    );

    const onDeleteConfirm = async () => {
        if (!selectedUser?.id) return;
        try {
            await adminClient.users.del({ id: selectedUser.id });
            toast.success(t("userDeletedSuccess"));
            setSelectedUser(undefined);
            refresh();
        } catch (error) {
            toast.error(t("userDeletedError", { error: getErrorMessage(error) }), {
                description: getErrorDescription(error)
            });
        }
    };

    const columns: ColumnDef<UserRepresentation>[] = [
        {
            accessorKey: "username",
            header: t("username"),
            cell: ({ row }) => (
                <Link
                    to={toUser({ realm, id: row.original.id!, tab: "settings" })}
                    className="text-primary hover:underline"
                >
                    {row.original.username}
                </Link>
            )
        },
        {
            accessorKey: "email",
            header: t("email"),
            cell: ({ row }) => emptyFormatter()(row.original.email) as string
        },
        {
            accessorKey: "lastName",
            header: t("lastName"),
            cell: ({ row }) => emptyFormatter()(row.original.lastName) as string
        },
        {
            accessorKey: "firstName",
            header: t("firstName"),
            cell: ({ row }) => emptyFormatter()(row.original.firstName) as string
        },
        ...(canManage
            ? [
                  {
                      id: "actions",
                      header: "",
                      size: 50,
                      enableHiding: false,
                      cell: ({ row }: { row: { original: UserRepresentation } }) => (
                          <DataTableRowActions row={row as { original: UserRepresentation; id: string; getValue: (id: string) => unknown }}>
                              <button
                                  type="button"
                                  className="flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                                  onClick={() => setEditUserId(row.original.id!)}
                              >
                                  <PencilSimple className="size-4 shrink-0" />
                                  {t("edit")}
                              </button>
                              <div className="my-1 h-px bg-border" />
                              <button
                                  type="button"
                                  className="flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left text-sm text-destructive hover:bg-destructive/10 hover:text-destructive"
                                  onClick={() => setSelectedUser(row.original)}
                              >
                                  <Trash className="size-4 shrink-0" />
                                  {t("delete")}
                              </button>
                          </DataTableRowActions>
                      )
                  } as ColumnDef<UserRepresentation>
              ]
            : [])
    ];

    return (
        <>
            <AlertDialog
                open={!!selectedUser}
                onOpenChange={(open) => !open && setSelectedUser(undefined)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t("deleteConfirmUsers", { count: 1, name: selectedUser?.username })}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("deleteConfirmDialog", { count: 1 })}
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

            <EditUserDialog
                open={!!editUserId}
                onOpenChange={(open) => !open && setEditUserId(null)}
                userId={editUserId}
                onSuccess={refresh}
            />

            <DataTable
                key={key}
                columns={columns}
                data={users}
                searchColumnId="username"
                searchPlaceholder={t("searchForUser")}
                emptyMessage={t("noUsersFound")}
                onRowClick={(row) => canManage && setEditUserId(row.original.id!)}
                toolbar={
                    canManage ? (
                        <AddUserDialog
                            trigger={
                                <Button
                                    type="button"
                                    data-testid="createUser"
                                    variant="default"
                                    className="flex h-9 w-9 shrink-0 items-center justify-center p-0 sm:h-9 sm:w-auto sm:gap-2 sm:px-4 sm:py-2"
                                    aria-label={t("createNewUser")}
                                >
                                    <Plus size={20} className="shrink-0 sm:hidden" />
                                    <span className="hidden sm:inline">{t("createNewUser")}</span>
                                </Button>
                            }
                            onSuccess={refresh}
                        />
                    ) : undefined
                }
            />
        </>
    );
}
