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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@merge-rd/ui/components/dropdown-menu";
import { FacetedFormFilter } from "@merge-rd/ui/components/faceted-filter/faceted-form-filter";
import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TablePaginationFooter,
    TableRow,
    type TableSortDirection
} from "@merge-rd/ui/components/table";
import { DotsThree, PencilSimple, Plus, Trash } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
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

    const [search, setSearch] = useState("");
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);
    const [sortBy, setSortBy] = useState<"name" | "description" | null>(null);
    const [sortDirection, setSortDirection] = useState<TableSortDirection>(false);

    const toggleSort = (column: "name" | "description") => {
        if (sortBy === column) {
            setSortDirection(prev =>
                prev === "asc" ? "desc" : prev === "desc" ? false : "asc"
            );
            if (sortDirection === "desc") setSortBy(null);
        } else {
            setSortBy(column);
            setSortDirection("asc");
        }
    };

    const filteredRoles = useMemo(() => {
        let result = roles;
        if (search) {
            const lower = search.toLowerCase();
            result = result.filter(r => r.name?.toLowerCase().includes(lower));
        }
        if (sortBy && sortDirection) {
            const dir = sortDirection === "asc" ? 1 : -1;
            result = [...result].sort((a, b) => {
                const aVal = (a[sortBy] ?? "").toLowerCase();
                const bVal = (b[sortBy] ?? "").toLowerCase();
                return aVal < bVal ? -dir : aVal > bVal ? dir : 0;
            });
        }
        return result;
    }, [roles, search, sortBy, sortDirection]);

    const totalCount = filteredRoles.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const paginatedRoles = useMemo(() => {
        const start = currentPage * pageSize;
        return filteredRoles.slice(start, start + pageSize);
    }, [filteredRoles, currentPage, pageSize]);

    useEffect(() => {
        setCurrentPage(0);
    }, [search, pageSize]);

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

    return (
        <>
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
                    {isManager && (
                        <AddRealmRoleDialog
                            trigger={
                                <Button
                                    type="button"
                                    data-testid="create-role"
                                    variant="default"
                                    size="sm"
                                >
                                    <Plus className="size-4" />
                                    <span>{t("createRole")}</span>
                                </Button>
                            }
                            onSuccess={refresh}
                        />
                    )}
                </div>

                <Table className="table-fixed">
                    <TableHeader>
                        <TableRow>
                            <TableHead
                                className="w-[30%]"
                                sortable
                                sortDirection={sortBy === "name" ? sortDirection : false}
                                onSort={() => toggleSort("name")}
                            >
                                {t("roleName")}
                            </TableHead>
                            <TableHead className="w-[15%]">{t("composite")}</TableHead>
                            <TableHead
                                className="w-[45%]"
                                sortable
                                sortDirection={sortBy === "description" ? sortDirection : false}
                                onSort={() => toggleSort("description")}
                            >
                                {t("description")}
                            </TableHead>
                            {isManager && <TableHead className="w-[10%]" />}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedRoles.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={isManager ? 4 : 3}
                                    className="text-center text-muted-foreground"
                                >
                                    {t("noRoles-roles")}
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedRoles.map(role => (
                                <TableRow
                                    key={role.id}
                                    className={isManager ? "cursor-pointer" : undefined}
                                    onClick={() =>
                                        isManager && setEditRoleId(role.id!)
                                    }
                                >
                                    <TableCell className="truncate">
                                        <RoleDetailLink
                                            {...role}
                                            defaultRoleName={
                                                realmRepresentation?.defaultRole?.name
                                            }
                                            toDetail={roleId =>
                                                toRealmRole({
                                                    realm,
                                                    id: roleId,
                                                    tab: "details"
                                                })
                                            }
                                        />
                                    </TableCell>
                                    <TableCell className="truncate">
                                        {emptyFormatter()(
                                            upperCaseFormatter()(role.composite)
                                        ) as string}
                                    </TableCell>
                                    <TableCell className="truncate">
                                        {translationFormatter(t)(
                                            role.description
                                        ) as string}
                                    </TableCell>
                                    {isManager && (
                                        <TableCell onClick={e => e.stopPropagation()}>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon-sm"
                                                    >
                                                        <DotsThree
                                                            weight="bold"
                                                            className="size-4"
                                                        />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            setEditRoleId(role.id!)
                                                        }
                                                    >
                                                        <PencilSimple className="size-4" />
                                                        {t("edit")}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="text-destructive focus:text-destructive"
                                                        onClick={() =>
                                                            onDeleteClick(role)
                                                        }
                                                    >
                                                        <Trash className="size-4" />
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
                            <TableCell colSpan={isManager ? 4 : 3} className="p-0">
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
            </div>
        </>
    );
}
