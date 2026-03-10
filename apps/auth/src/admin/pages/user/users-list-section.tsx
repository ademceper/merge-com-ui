import type UserRepresentation from "@keycloak/keycloak-admin-client/lib/defs/userRepresentation";
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
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { getErrorDescription, getErrorMessage } from "@/shared/keycloak-ui-shared";
import { useAccess } from "@/admin/app/providers/access/access";
import { useRealm } from "@/admin/app/providers/realm-context/realm-context";
import { toUser } from "@/admin/shared/lib/routes/user";
import { emptyFormatter } from "@/admin/shared/lib/util";
import { AddUserDialog } from "./add-user-dialog";
import { userKeys } from "./hooks/keys";
import { useDeleteUser } from "./hooks/use-delete-user";
import { useUsers } from "./hooks/use-users";
import { EditUserDialog } from "./edit-user-dialog";

export function UsersListSection() {
    const { t } = useTranslation();
    const { realm } = useRealm();
    const { hasAccess } = useAccess();
    const canManage = hasAccess("manage-users");

    const queryClient = useQueryClient();
    const { data: users = [] } = useUsers();
    const { mutateAsync: deleteUserMut } = useDeleteUser();
    const refresh = () => queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    const [selectedUser, setSelectedUser] = useState<UserRepresentation | undefined>();
    const [editUserId, setEditUserId] = useState<string | null>(null);

    const [search, setSearch] = useState("");
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);
    const [sortBy, setSortBy] = useState<"username" | "email" | "lastName" | "firstName" | null>(null);
    const [sortDirection, setSortDirection] = useState<TableSortDirection>(false);

    const toggleSort = (column: "username" | "email" | "lastName" | "firstName") => {
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

    const filteredUsers = useMemo(() => {
        let result = users;
        if (search) {
            const lower = search.toLowerCase();
            result = result.filter(u => u.username?.toLowerCase().includes(lower));
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
    }, [users, search, sortBy, sortDirection]);

    const totalCount = filteredUsers.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const paginatedUsers = useMemo(() => {
        const start = currentPage * pageSize;
        return filteredUsers.slice(start, start + pageSize);
    }, [filteredUsers, currentPage, pageSize]);

    useEffect(() => {
        setCurrentPage(0);
    }, [search, pageSize]);

    const onDeleteConfirm = async () => {
        if (!selectedUser?.id) return;
        try {
            await deleteUserMut(selectedUser.id);
            toast.success(t("userDeletedSuccess"));
            setSelectedUser(undefined);
            refresh();
        } catch (error) {
            toast.error(t("userDeletedError", { error: getErrorMessage(error) }), {
                description: getErrorDescription(error)
            });
        }
    };

    return (
        <>
            <AlertDialog
                open={!!selectedUser}
                onOpenChange={open => !open && setSelectedUser(undefined)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {t("deleteConfirmUsers", {
                                count: 1,
                                name: selectedUser?.username
                            })}
                        </AlertDialogTitle>
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
                onOpenChange={open => !open && setEditUserId(null)}
                userId={editUserId}
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
                        placeholder={t("searchForUser")}
                    />
                    {canManage && (
                        <AddUserDialog
                            trigger={
                                <Button
                                    type="button"
                                    data-testid="createUser"
                                    variant="default"
                                    size="sm"
                                >
                                    <Plus className="size-4" />
                                    <span>{t("createNewUser")}</span>
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
                                className="w-[25%]"
                                sortable
                                sortDirection={sortBy === "username" ? sortDirection : false}
                                onSort={() => toggleSort("username")}
                            >
                                {t("username")}
                            </TableHead>
                            <TableHead
                                className="w-[25%]"
                                sortable
                                sortDirection={sortBy === "email" ? sortDirection : false}
                                onSort={() => toggleSort("email")}
                            >
                                {t("email")}
                            </TableHead>
                            <TableHead
                                className="w-[20%]"
                                sortable
                                sortDirection={sortBy === "lastName" ? sortDirection : false}
                                onSort={() => toggleSort("lastName")}
                            >
                                {t("lastName")}
                            </TableHead>
                            <TableHead
                                className="w-[20%]"
                                sortable
                                sortDirection={sortBy === "firstName" ? sortDirection : false}
                                onSort={() => toggleSort("firstName")}
                            >
                                {t("firstName")}
                            </TableHead>
                            {canManage && <TableHead className="w-[10%]" />}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedUsers.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={canManage ? 5 : 4}
                                    className="text-center text-muted-foreground"
                                >
                                    {t("noUsersFound")}
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedUsers.map(user => (
                                <TableRow
                                    key={user.id}
                                    className={canManage ? "cursor-pointer" : undefined}
                                    onClick={() =>
                                        canManage && setEditUserId(user.id!)
                                    }
                                >
                                    <TableCell className="truncate">
                                        <Link
                                            to={
                                                toUser({
                                                    realm,
                                                    id: user.id!,
                                                    tab: "settings"
                                                }) as string
                                            }
                                            className="text-primary hover:underline"
                                            onClick={e => e.stopPropagation()}
                                        >
                                            {user.username}
                                        </Link>
                                    </TableCell>
                                    <TableCell className="truncate">
                                        {emptyFormatter()(user.email) as string}
                                    </TableCell>
                                    <TableCell className="truncate">
                                        {emptyFormatter()(user.lastName) as string}
                                    </TableCell>
                                    <TableCell className="truncate">
                                        {emptyFormatter()(user.firstName) as string}
                                    </TableCell>
                                    {canManage && (
                                        <TableCell onClick={e => e.stopPropagation()}>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon-sm">
                                                        <DotsThree
                                                            weight="bold"
                                                            className="size-4"
                                                        />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            setEditUserId(user.id!)
                                                        }
                                                    >
                                                        <PencilSimple className="size-4" />
                                                        {t("edit")}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="text-destructive focus:text-destructive"
                                                        onClick={() =>
                                                            setSelectedUser(user)
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
                            <TableCell colSpan={canManage ? 5 : 4} className="p-0">
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
