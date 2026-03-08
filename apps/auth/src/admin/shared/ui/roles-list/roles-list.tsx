import type RoleRepresentation from "@keycloak/keycloak-admin-client/lib/defs/roleRepresentation";
import { useTranslation } from "@merge-rd/i18n";
import { Button } from "@merge-rd/ui/components/button";
import { DropdownMenuItem } from "@merge-rd/ui/components/dropdown-menu";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyTitle
} from "@merge-rd/ui/components/empty";
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
} from "../../../../shared/keycloak-ui-shared";
import { useAccess } from "../../../app/providers/access/access";
import { useRealm } from "../../../app/providers/realm-context/realm-context";
import { useDeleteRealmRole } from "../../../pages/realm-roles/hooks/use-delete-realm-role";
import { useRemoveCompositeRoles } from "../../../pages/realm-roles/hooks/use-remove-composite-roles";
import { useRolesList as useRolesListQuery } from "../../api/use-roles-list";
import { toRealmSettings } from "../../lib/route-helpers";
import { translationFormatter } from "../../lib/translation-formatter";
import { emptyFormatter, upperCaseFormatter } from "../../lib/util";
import { useConfirmDialog } from "../confirm-dialog/confirm-dialog";

type RoleDetailLinkProps = RoleRepresentation & {
    defaultRoleName?: string;
    toDetail: (roleId: string) => string;
    messageBundle?: string;
};

const RoleDetailLink = ({ defaultRoleName, toDetail, ...role }: RoleDetailLinkProps) => {
    const { t } = useTranslation();
    const { realm } = useRealm();
    const { hasAccess, hasSomeAccess } = useAccess();
    const canViewUserRegistration =
        hasAccess("view-realm") && hasSomeAccess("view-clients", "manage-clients");

    return role.name !== defaultRoleName ? (
        <Link to={toDetail(role.id!) as string}>{role.name}</Link>
    ) : (
        <>
            {canViewUserRegistration ? (
                <Link to={toRealmSettings({ realm, tab: "user-registration" }) as string}>
                    {role.name}
                </Link>
            ) : (
                <span>{role.name}</span>
            )}{" "}
            <HelpItem helpText={t("defaultRole")} fieldLabelId="defaultRole" />
        </>
    );
};

type RolesListProps = {
    paginated?: boolean;
    parentRoleId?: string;
    messageBundle?: string;
    isReadOnly: boolean;
    toCreate: string;
    toDetail: (roleId: string) => string;
    loader?: (
        first?: number,
        max?: number,
        search?: string
    ) => Promise<RoleRepresentation[]>;
};

export const RolesList = ({
    loader,
    parentRoleId,
    messageBundle = "roles",
    toCreate,
    toDetail,
    isReadOnly
}: RolesListProps) => {

    const { t } = useTranslation();
    const { realmRepresentation: realm } = useRealm();

    const [selectedRole, setSelectedRole] = useState<RoleRepresentation>();

    const { data: roles = [] } = useRolesListQuery(loader!, parentRoleId);
    const { mutateAsync: deleteRoleMut } = useDeleteRealmRole();
    const { mutateAsync: removeCompositesMut } = useRemoveCompositeRoles();

    const [toggleDeleteDialog, DeleteConfirm] = useConfirmDialog({
        titleKey: "roleDeleteConfirm",
        messageKey: t("roleDeleteConfirmDialog", {
            selectedRoleName: selectedRole ? selectedRole!.name : ""
        }),
        continueButtonLabel: "delete",
        continueButtonVariant: "destructive",
        onConfirm: async () => {
            try {
                if (!parentRoleId) {
                    await deleteRoleMut(selectedRole!.id!);
                } else {
                    await removeCompositesMut({
                        parentRoleId,
                        roles: [selectedRole!]
                    });
                }
                setSelectedRole(undefined);
                toast.success(t("roleDeletedSuccess"));
            } catch (error) {
                toast.error(t("roleDeleteError", { error: getErrorMessage(error) }), {
                    description: getErrorDescription(error)
                });
            }
        }
    });

    const columns: ColumnDef<RoleRepresentation>[] = [
        {
            accessorKey: "name",
            header: t("roleName"),
            cell: ({ row }) => (
                <RoleDetailLink
                    {...row.original}
                    defaultRoleName={realm?.defaultRole?.name}
                    toDetail={toDetail}
                    messageBundle={messageBundle}
                />
            )
        },
        {
            accessorKey: "composite",
            header: t("composite"),
            cell: ({ getValue }) => upperCaseFormatter()(emptyFormatter()(getValue()))
        },
        {
            accessorKey: "description",
            header: t("description"),
            cell: ({ row }) => translationFormatter(t)(row.original.description)
        },
        ...(isReadOnly
            ? []
            : ([
                  {
                      id: "actions",
                      cell: ({ row }) => (
                          <DataTableRowActions row={row}>
                              <DropdownMenuItem
                                  onClick={() => {
                                      setSelectedRole(row.original);
                                      if (
                                          realm?.defaultRole &&
                                          row.original.name === realm.defaultRole.name
                                      ) {
                                          toast.error(t("defaultRoleDeleteError"));
                                      } else toggleDeleteDialog();
                                  }}
                                  className="text-destructive"
                              >
                                  {t("delete")}
                              </DropdownMenuItem>
                          </DataTableRowActions>
                      )
                  }
              ] as ColumnDef<RoleRepresentation>[]))
    ];

    const emptyContent = (
        <Empty className="py-12">
            <EmptyHeader>
                <EmptyTitle>{t(`noRoles-${messageBundle}`)}</EmptyTitle>
            </EmptyHeader>
            <EmptyContent>
                <EmptyDescription>
                    {isReadOnly ? "" : t(`noRolesInstructions-${messageBundle}`)}
                </EmptyDescription>
            </EmptyContent>
            {!isReadOnly && (
                <Button className="mt-2" asChild>
                    <Link to={toCreate as string}>{t("createRole")}</Link>
                </Button>
            )}
        </Empty>
    );

    return (
        <>
            <DeleteConfirm />
            <DataTable<RoleRepresentation>
                key={selectedRole ? selectedRole.id : "roleList"}
                columns={columns}
                data={roles}
                searchColumnId="name"
                searchPlaceholder={t("searchForRoles")}
                emptyContent={emptyContent}
                emptyMessage={t(`noRoles-${messageBundle}`)}
                toolbar={
                    !isReadOnly ? (
                        <Button data-testid="create-role" asChild>
                            <Link to={toCreate as string}>{t("createRole")}</Link>
                        </Button>
                    ) : undefined
                }
            />
        </>
    );
};
