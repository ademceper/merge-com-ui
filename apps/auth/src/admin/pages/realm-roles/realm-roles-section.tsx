import type RoleRepresentation from "@keycloak/keycloak-admin-client/lib/defs/roleRepresentation";
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
import { PencilSimple, Plus, Trash } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
    type ColumnDef,
    DataTable,
    DataTableRowActions
} from "@/admin/shared/ui/data-table";
import {
    getErrorDescription,
    getErrorMessage,
    HelpItem
} from "@/shared/keycloak-ui-shared";
import { useAccess } from "@/admin/app/providers/access/access";
import { useDeleteRealmRole } from "./hooks/use-delete-realm-role";
import { useRealm } from "@/admin/app/providers/realm-context/realm-context";
import { toRealmSettings } from "@/admin/shared/lib/route-helpers";
import { toRealmRole } from "@/admin/shared/lib/routes/realm-roles";
import { translationFormatter } from "@/admin/shared/lib/translation-formatter";
import { emptyFormatter, upperCaseFormatter } from "@/admin/shared/lib/util";
import { AddRealmRoleDialog } from "./add-realm-role-dialog";
import { useRealmRoles } from "./hooks/use-realm-roles";
import { EditRealmRoleDialog } from "./edit-realm-role-dialog";

type RoleDetailLinkProps = RoleRepresentation & {
    defaultRoleName?: string;
    toDetail: (roleId: string) => ReturnType<typeof toRealmRole>;
};

function RoleDetailLink({ defaultRoleName, toDetail, ...role }: RoleDetailLinkProps) {
    const { t } = useTranslation();
    const { realm } = useRealm();
    const { hasAccess, hasSomeAccess } = useAccess();
    const canViewUserRegistration =
        hasAccess("view-realm") && hasSomeAccess("view-clients", "manage-clients");

    if (role.name === defaultRoleName) {
        return (
            <span className="inline-flex items-center gap-1.5 flex-nowrap">
                {canViewUserRegistration ? (
                    <Link
                        to={
                            toRealmSettings({ realm, tab: "user-registration" }) as string
                        }
                        className="text-primary hover:underline"
                    >
                        {role.name}
                    </Link>
                ) : (
                    <span>{role.name}</span>
                )}
                <HelpItem helpText={t("defaultRole")} fieldLabelId="defaultRole" />
            </span>
        );
    }
    return (
        <Link to={toDetail(role.id!) as string} className="text-primary hover:underline">
            {role.name}
        </Link>
    );
}

export function RealmRolesSection() {
    const { t } = useTranslation();
    const { realm, realmRepresentation } = useRealm();
    const { hasAccess } = useAccess();
    const isManager = hasAccess("manage-realm");

    const { data: roles = [], refetch: refreshRoles } = useRealmRoles();
    const refresh = () => refreshRoles();
    const [selectedRole, setSelectedRole] = useState<RoleRepresentation | undefined>();
    const [editRoleId, setEditRoleId] = useState<string | null>(null);
    const { mutateAsync: deleteRole } = useDeleteRealmRole();

    const onDeleteClick = (role: RoleRepresentation) => {
        if (
            realmRepresentation?.defaultRole &&
            role.name === realmRepresentation.defaultRole?.name
        ) {
            toast.error(t("defaultRoleDeleteError"));
            return;
        }
        setSelectedRole(role);
    };

    const onDeleteConfirm = async () => {
        if (!selectedRole?.id) return;
        try {
            await deleteRole(selectedRole.id);
            toast.success(t("roleDeletedSuccess"));
            setSelectedRole(undefined);
            refresh();
        } catch (error) {
            toast.error(t("roleDeleteError", { error: getErrorMessage(error) }), {
                description: getErrorDescription(error)
            });
        }
    };

    const columns: ColumnDef<RoleRepresentation>[] = [
        {
            accessorKey: "name",
            header: t("roleName"),
            cell: ({ row }) => (
                <RoleDetailLink
                    {...row.original}
                    defaultRoleName={realmRepresentation?.defaultRole?.name}
                    toDetail={roleId =>
                        toRealmRole({ realm, id: roleId, tab: "details" })
                    }
                />
            )
        },
        {
            accessorKey: "composite",
            header: t("composite"),
            cell: ({ row }) => {
                const v = row.original.composite;
                const formatted = upperCaseFormatter()(v);
                return emptyFormatter()(formatted);
            }
        },
        {
            accessorKey: "description",
            header: t("description"),
            cell: ({ row }) => translationFormatter(t)(row.original.description) as string
        },
        ...(isManager
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
                                  className="flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                                  onClick={() => setEditRoleId(row.original.id!)}
                              >
                                  <PencilSimple className="size-4 shrink-0" />
                                  {t("edit")}
                              </button>
                              <div className="my-1 h-px bg-border" />
                              <button
                                  type="button"
                                  className="flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left text-sm text-destructive hover:bg-destructive/10 hover:text-destructive"
                                  onClick={() => onDeleteClick(row.original)}
                              >
                                  <Trash className="size-4 shrink-0" />
                                  {t("delete")}
                              </button>
                          </DataTableRowActions>
                      )
                  } as ColumnDef<RoleRepresentation>
              ]
            : [])
    ];

    return (
        <div className="pt-4 pb-6 px-0">
            <AlertDialog
                open={!!selectedRole}
                onOpenChange={open => !open && setSelectedRole(undefined)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t("roleDeleteConfirm")}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("roleDeleteConfirmDialog", {
                                selectedRoleName: selectedRole?.name ?? ""
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

            <EditRealmRoleDialog
                open={!!editRoleId}
                onOpenChange={open => !open && setEditRoleId(null)}
                roleId={editRoleId}
                onSuccess={refresh}
            />

            <DataTable
                columns={columns}
                data={roles}
                searchColumnId="name"
                searchPlaceholder={t("searchForRoles")}
                emptyMessage={t("noRoles-roles")}
                onRowClick={row => isManager && setEditRoleId(row.original.id!)}
                toolbar={
                    isManager ? (
                        <AddRealmRoleDialog
                            trigger={
                                <Button
                                    type="button"
                                    data-testid="create-role"
                                    variant="default"
                                    className="flex h-9 w-9 shrink-0 items-center justify-center p-0 sm:h-9 sm:w-auto sm:gap-2 sm:px-4 sm:py-2"
                                    aria-label={t("createRole")}
                                >
                                    <Plus size={20} className="shrink-0 sm:hidden" />
                                    <span className="hidden sm:inline">
                                        {t("createRole")}
                                    </span>
                                </Button>
                            }
                            onSuccess={refresh}
                        />
                    ) : undefined
                }
            />
        </div>
    );
}
