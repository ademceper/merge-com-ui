import type RoleRepresentation from "@keycloak/keycloak-admin-client/lib/defs/roleRepresentation";
import { useTranslation } from "@merge-rd/i18n";
import { Button } from "@merge-rd/ui/components/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@merge-rd/ui/components/dropdown-menu";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyTitle
} from "@merge-rd/ui/components/empty";
import { FacetedFormFilter } from "@merge-rd/ui/components/faceted-filter/faceted-form-filter";
import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TablePaginationFooter,
    TableRow
} from "@merge-rd/ui/components/table";
import { DotsThree } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
    getErrorDescription,
    getErrorMessage,
    HelpItem
} from "@/shared/keycloak-ui-shared";
import { useAccess } from "@/admin/app/providers/access/access";
import { useRealm } from "@/admin/app/providers/realm-context/realm-context";
import { useDeleteRealmRole } from "@/admin/pages/realm-roles/hooks/use-delete-realm-role";
import { useRemoveCompositeRoles } from "@/admin/pages/realm-roles/hooks/use-remove-composite-roles";
import { useRolesList as useRolesListQuery } from "@/admin/shared/api/use-roles-list";
import { toRealmSettings } from "@/admin/shared/lib/route-helpers";
import { translationFormatter } from "@/admin/shared/lib/translation-formatter";
import { emptyFormatter, upperCaseFormatter } from "@/admin/shared/lib/util";
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

    const [search, setSearch] = useState("");
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);

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

    const filteredRoles = useMemo(() => {
        if (!search) return roles;
        const lower = search.toLowerCase();
        return roles.filter(r => r.name?.toLowerCase().includes(lower));
    }, [roles, search]);

    const totalCount = filteredRoles.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const paginatedRoles = useMemo(() => {
        const start = currentPage * pageSize;
        return filteredRoles.slice(start, start + pageSize);
    }, [filteredRoles, currentPage, pageSize]);

    useEffect(() => {
        setCurrentPage(0);
    }, [search, pageSize]);

    const colSpan = isReadOnly ? 3 : 4;

    return (
        <>
            <DeleteConfirm />
            <div className="flex h-full w-full flex-col">
                <div className="flex items-center justify-between gap-2 py-2.5">
                    <FacetedFormFilter
                        type="text"
                        size="small"
                        title={t("search")}
                        value={search}
                        onChange={value => setSearch(value)}
                        placeholder={t("searchForRoles")}
                    />
                    {!isReadOnly && (
                        <Button data-testid="create-role" asChild>
                            <Link to={toCreate as string}>{t("createRole")}</Link>
                        </Button>
                    )}
                </div>

                {totalCount === 0 && !search ? (
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
                ) : (
                    <Table className="table-fixed">
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[30%]">{t("roleName")}</TableHead>
                                <TableHead className="w-[15%]">{t("composite")}</TableHead>
                                <TableHead className="w-[45%]">{t("description")}</TableHead>
                                {!isReadOnly && <TableHead className="w-[10%]" />}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedRoles.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={colSpan}
                                        className="text-center text-muted-foreground"
                                    >
                                        {t(`noRoles-${messageBundle}`)}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedRoles.map(role => (
                                    <TableRow key={role.id}>
                                        <TableCell className="truncate">
                                            <RoleDetailLink
                                                {...role}
                                                defaultRoleName={realm?.defaultRole?.name}
                                                toDetail={toDetail}
                                                messageBundle={messageBundle}
                                            />
                                        </TableCell>
                                        <TableCell className="truncate">
                                            {upperCaseFormatter()(emptyFormatter()(role.composite))}
                                        </TableCell>
                                        <TableCell className="truncate">
                                            {translationFormatter(t)(role.description) as string}
                                        </TableCell>
                                        {!isReadOnly && (
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon-sm">
                                                            <DotsThree weight="bold" className="size-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                            onClick={() => {
                                                                setSelectedRole(role);
                                                                if (
                                                                    realm?.defaultRole &&
                                                                    role.name === realm.defaultRole.name
                                                                ) {
                                                                    toast.error(t("defaultRoleDeleteError"));
                                                                } else toggleDeleteDialog();
                                                            }}
                                                            className="text-destructive focus:text-destructive"
                                                        >
                                                            {t("delete")}
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TableCell colSpan={colSpan} className="p-0">
                                    <TablePaginationFooter
                                        pageSize={pageSize}
                                        onPageSizeChange={setPageSize}
                                        onPreviousPage={() =>
                                            setCurrentPage(p => Math.max(0, p - 1))
                                        }
                                        onNextPage={() =>
                                            setCurrentPage(p =>
                                                Math.min(totalPages - 1, p + 1)
                                            )
                                        }
                                        hasPreviousPage={currentPage > 0}
                                        hasNextPage={currentPage < totalPages - 1}
                                        totalCount={totalCount}
                                    />
                                </TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                )}
            </div>
        </>
    );
};
