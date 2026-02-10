import type RoleRepresentation from "@keycloak/keycloak-admin-client/lib/defs/roleRepresentation";
import { getErrorDescription, getErrorMessage, HelpItem } from "../../../shared/keycloak-ui-shared";
import { toast } from "@merge/ui/components/sonner";
import { Button } from "@merge/ui/components/button";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, To } from "react-router-dom";
import { useAdminClient } from "../../admin-client";
import { useAccess } from "../../context/access/Access";
import { useRealm } from "../../context/realm-context/RealmContext";
import { toRealmSettings } from "../../realm-settings/routes/RealmSettings";
import { emptyFormatter, upperCaseFormatter } from "../../util";
import { translationFormatter } from "../../utils/translationFormatter";
import { useConfirmDialog } from "../confirm-dialog/ConfirmDialog";
import { useFetch } from "../../../shared/keycloak-ui-shared";
import { DataTable, DataTableRowActions, type ColumnDef } from "@merge/ui/components/table";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyTitle
} from "@merge/ui/components/empty";
import { DropdownMenuItem } from "@merge/ui/components/dropdown-menu";

type RoleDetailLinkProps = RoleRepresentation & {
    defaultRoleName?: string;
    toDetail: (roleId: string) => To;
    messageBundle?: string;
};

const RoleDetailLink = ({ defaultRoleName, toDetail, ...role }: RoleDetailLinkProps) => {
    const { t } = useTranslation();
    const { realm } = useRealm();
    const { hasAccess, hasSomeAccess } = useAccess();
    const canViewUserRegistration =
        hasAccess("view-realm") && hasSomeAccess("view-clients", "manage-clients");

    return role.name !== defaultRoleName ? (
        <Link to={toDetail(role.id!)}>{role.name}</Link>
    ) : (
        <>
            {canViewUserRegistration ? (
                <Link to={toRealmSettings({ realm, tab: "user-registration" })}>
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
    toCreate: To;
    toDetail: (roleId: string) => To;
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
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
    const { realmRepresentation: realm } = useRealm();

    const [selectedRole, setSelectedRole] = useState<RoleRepresentation>();
    const [roles, setRoles] = useState<RoleRepresentation[]>([]);

    useFetch(() => loader!(0, 500), setRoles, [parentRoleId]);

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
                    await adminClient.roles.delById({
                        id: selectedRole!.id!
                    });
                } else {
                    await adminClient.roles.delCompositeRoles({ id: parentRoleId }, [
                        selectedRole!
                    ]);
                }
                setSelectedRole(undefined);
                toast.success(t("roleDeletedSuccess"));
            } catch (error) {
                toast.error(t("roleDeleteError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
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
        { accessorKey: "composite", header: t("composite"), cell: ({ getValue }) => upperCaseFormatter()(emptyFormatter()(getValue())) },
        { accessorKey: "description", header: t("description"), cell: ({ row }) => translationFormatter(t)(row.original.description) },
        ...(isReadOnly ? [] : [{
            id: "actions",
            cell: ({ row }) => (
                <DataTableRowActions row={row}>
                    <DropdownMenuItem
                        onClick={() => {
                            setSelectedRole(row.original);
                            if (realm?.defaultRole && row.original.name === realm.defaultRole.name) {
                                toast.error(t("defaultRoleDeleteError"));
                            } else toggleDeleteDialog();
                        }}
                        className="text-destructive"
                    >
                        {t("delete")}
                    </DropdownMenuItem>
                </DataTableRowActions>
            )
        }] as ColumnDef<RoleRepresentation>[])
    ];

    const emptyContent = (
        <Empty className="py-12">
            <EmptyHeader><EmptyTitle>{t(`noRoles-${messageBundle}`)}</EmptyTitle></EmptyHeader>
            <EmptyContent><EmptyDescription>{isReadOnly ? "" : t(`noRolesInstructions-${messageBundle}`)}</EmptyDescription></EmptyContent>
            {!isReadOnly && <Button className="mt-2" asChild><Link to={toCreate}>{t("createRole")}</Link></Button>}
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
                toolbar={!isReadOnly ? (
                    <Button data-testid="create-role" asChild>
                        <Link to={toCreate}>{t("createRole")}</Link>
                    </Button>
                ) : undefined}
            />
        </>
    );
};
