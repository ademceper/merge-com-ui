import type UserSessionRepresentation from "@keycloak/keycloak-admin-client/lib/defs/userSessionRepresentation";
import { useTranslation } from "@merge-rd/i18n";
import { Badge } from "@merge-rd/ui/components/badge";
import { Button } from "@merge-rd/ui/components/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@merge-rd/ui/components/tooltip";
import { DotsThree, Info, ProhibitInset, SignOut } from "@phosphor-icons/react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
    getErrorDescription,
    getErrorMessage,
    useEnvironment
} from "@/shared/keycloak-ui-shared";
import { useRealm } from "@/admin/app/providers/realm-context/realm-context";
import { useDeleteSession } from "./hooks/use-delete-session";
import { useLogoutUser } from "./hooks/use-logout-user";
import { useWhoAmI } from "@/admin/app/providers/whoami/who-am-i";
import { toClient } from "@/admin/shared/lib/routes/clients";
import { toUser, toUsers } from "@/admin/shared/lib/routes/user";
import { useFormatDate } from "@/admin/shared/lib/use-format-date";
import { useConfirmDialog } from "@/admin/shared/ui/confirm-dialog/confirm-dialog";
import { isLightweightUser } from "../user/utils";

type ColumnName = "username" | "start" | "lastAccess" | "clients" | "type" | "ipAddress";

type SessionsTableProps = {
    sessions: UserSessionRepresentation[];
    refresh: () => void;
    toolbar?: ReactNode;
    hiddenColumns?: ColumnName[];
    emptyMessage?: string;
    logoutUser?: string;
};

export function SessionsTable({
    sessions,
    refresh,
    toolbar,
    hiddenColumns = [],
    emptyMessage,
    logoutUser
}: SessionsTableProps) {
    const { keycloak } = useEnvironment();
    const { realm } = useRealm();
    const { whoAmI } = useWhoAmI();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const formatDate = useFormatDate();
    const refreshInternal = () => refresh();
    const location = useLocation();
    const isOnUserPage = location.pathname.includes("/users/");
    const { mutateAsync: deleteSessionMut } = useDeleteSession();
    const { mutateAsync: logoutUserMut } = useLogoutUser();

    const [search, setSearch] = useState("");
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);
    const [sortBy, setSortBy] = useState<"username" | "start" | null>(null);
    const [sortDirection, setSortDirection] = useState<TableSortDirection>(false);

    const [toggleLogoutDialog, LogoutConfirm] = useConfirmDialog({
        titleKey: "logoutAllSessions",
        messageKey: "logoutAllDescription",
        continueButtonLabel: "confirm",
        onConfirm: async () => {
            try {
                await logoutUserMut(logoutUser!);
                if (isOnUserPage && logoutUser && isLightweightUser(logoutUser)) {
                    navigate({ to: toUsers({ realm }) as string });
                } else {
                    refreshInternal();
                }
            } catch (error) {
                toast.error(
                    t("logoutAllSessionsError", { error: getErrorMessage(error) }),
                    {
                        description: getErrorDescription(error)
                    }
                );
            }
        }
    });

    const onClickRevoke = async (session: UserSessionRepresentation) => {
        await deleteSessionMut({ sessionId: session.id!, isOffline: true });
        refreshInternal();
    };

    const onClickSignOut = async (session: UserSessionRepresentation) => {
        await deleteSessionMut({ sessionId: session.id!, isOffline: false });
        if (session.userId === whoAmI.userId) {
            await keycloak.logout({ redirectUri: "" });
        } else if (isOnUserPage && session.userId && isLightweightUser(session.userId)) {
            navigate({ to: toUsers({ realm }) as string });
        } else {
            refreshInternal();
        }
    };

    const toggleSort = (column: "username" | "start") => {
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

    const filteredSessions = useMemo(() => {
        let result = sessions;
        if (search) {
            const lower = search.toLowerCase();
            result = result.filter(s => s.username?.toLowerCase().includes(lower));
        }
        if (sortBy && sortDirection) {
            const dir = sortDirection === "asc" ? 1 : -1;
            result = [...result].sort((a, b) => {
                const aVal = (sortBy === "start"
                    ? String(a.start ?? "")
                    : (a.username ?? "").toLowerCase());
                const bVal = (sortBy === "start"
                    ? String(b.start ?? "")
                    : (b.username ?? "").toLowerCase());
                return aVal < bVal ? -dir : aVal > bVal ? dir : 0;
            });
        }
        return result;
    }, [sessions, search, sortBy, sortDirection]);

    const totalCount = filteredSessions.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const paginatedSessions = useMemo(() => {
        const start = currentPage * pageSize;
        return filteredSessions.slice(start, start + pageSize);
    }, [filteredSessions, currentPage, pageSize]);

    useEffect(() => {
        setCurrentPage(0);
    }, [search, pageSize]);

    const isColumnVisible = (column: ColumnName) => !hiddenColumns.includes(column);

    const visibleColumnCount =
        (["username", "type", "start", "lastAccess", "ipAddress", "clients"] as ColumnName[])
            .filter(isColumnVisible).length + 1; // +1 for actions column

    return (
        <>
            <LogoutConfirm />
            <div className="flex h-full w-full flex-col">
                <div className="flex items-center justify-between gap-2 py-2.5">
                    <FacetedFormFilter
                        type="text"
                        size="small"
                        title={t("search")}
                        value={search}
                        onChange={value => setSearch(value)}
                        placeholder={t("searchForSession")}
                    />
                    {(toolbar || logoutUser) && (
                        <div className="flex items-center gap-2">
                            {toolbar}
                            {logoutUser && (
                                <Button
                                    type="button"
                                    variant="default"
                                    className="flex h-9 w-9 shrink-0 items-center justify-center p-0 sm:h-9 sm:w-auto sm:gap-2 sm:px-4 sm:py-2"
                                    onClick={toggleLogoutDialog}
                                    data-testid="logout-all"
                                >
                                    <SignOut size={20} className="shrink-0 sm:hidden" />
                                    <span className="hidden sm:inline">
                                        {t("logoutAllSessions")}
                                    </span>
                                </Button>
                            )}
                        </div>
                    )}
                </div>

                <Table className="table-fixed">
                    <TableHeader>
                        <TableRow>
                            {isColumnVisible("username") && (
                                <TableHead
                                    className="w-[20%]"
                                    sortable
                                    sortDirection={sortBy === "username" ? sortDirection : false}
                                    onSort={() => toggleSort("username")}
                                >
                                    {t("user")}
                                </TableHead>
                            )}
                            {isColumnVisible("type") && (
                                <TableHead className="w-[10%]">
                                    {t("type")}
                                </TableHead>
                            )}
                            {isColumnVisible("start") && (
                                <TableHead
                                    className="w-[15%]"
                                    sortable
                                    sortDirection={sortBy === "start" ? sortDirection : false}
                                    onSort={() => toggleSort("start")}
                                >
                                    {t("started")}
                                </TableHead>
                            )}
                            {isColumnVisible("lastAccess") && (
                                <TableHead className="w-[15%]">
                                    {t("lastAccess")}
                                </TableHead>
                            )}
                            {isColumnVisible("ipAddress") && (
                                <TableHead className="w-[12%]">
                                    {t("ipAddress")}
                                </TableHead>
                            )}
                            {isColumnVisible("clients") && (
                                <TableHead className="w-[18%]">
                                    {t("clients")}
                                </TableHead>
                            )}
                            <TableHead className="w-[10%]" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedSessions.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={visibleColumnCount}
                                    className="text-center text-muted-foreground"
                                >
                                    {emptyMessage ?? t("noSessions")}
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedSessions.map(session => {
                                const sessionWithType = session as UserSessionRepresentation & {
                                    type?: string;
                                };
                                const isOffline =
                                    sessionWithType.type === "Offline" || sessionWithType.type === "OFFLINE";
                                return (
                                    <TableRow key={session.id}>
                                        {isColumnVisible("username") && (
                                            <TableCell className="truncate">
                                                <Link
                                                    to={
                                                        toUser({
                                                            realm,
                                                            id: session.userId!,
                                                            tab: "sessions"
                                                        }) as string
                                                    }
                                                    className="text-primary hover:underline"
                                                >
                                                    {session.username}
                                                    {session.transientUser && (
                                                        <>
                                                            {" "}
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Badge
                                                                        variant="secondary"
                                                                        data-testid="user-details-label-transient-user"
                                                                        className="gap-1 cursor-help"
                                                                    >
                                                                        <Info className="size-3" />
                                                                        {t("transientUser")}
                                                                    </Badge>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    {t("transientUserTooltip")}
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </>
                                                    )}
                                                </Link>
                                            </TableCell>
                                        )}
                                        {isColumnVisible("type") && (
                                            <TableCell className="truncate">
                                                {sessionWithType.type}
                                            </TableCell>
                                        )}
                                        {isColumnVisible("start") && (
                                            <TableCell className="truncate">
                                                {formatDate(new Date(session.start!))}
                                            </TableCell>
                                        )}
                                        {isColumnVisible("lastAccess") && (
                                            <TableCell className="truncate">
                                                {formatDate(new Date(session.lastAccess!))}
                                            </TableCell>
                                        )}
                                        {isColumnVisible("ipAddress") && (
                                            <TableCell className="truncate">
                                                {session.ipAddress}
                                            </TableCell>
                                        )}
                                        {isColumnVisible("clients") && (
                                            <TableCell>
                                                <div className="flex flex-wrap gap-x-2 gap-y-1">
                                                    {Object.entries(session.clients ?? {}).map(
                                                        ([clientId, client]) => (
                                                            <Link
                                                                key={clientId}
                                                                to={
                                                                    toClient({
                                                                        realm,
                                                                        clientId,
                                                                        tab: "sessions"
                                                                    }) as string
                                                                }
                                                                className="text-primary hover:underline"
                                                            >
                                                                {client}
                                                            </Link>
                                                        )
                                                    )}
                                                </div>
                                            </TableCell>
                                        )}
                                        <TableCell>
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
                                                    {isOffline ? (
                                                        <DropdownMenuItem
                                                            onClick={() => onClickRevoke(session)}
                                                        >
                                                            <ProhibitInset className="size-4" />
                                                            {t("revoke")}
                                                        </DropdownMenuItem>
                                                    ) : (
                                                        <DropdownMenuItem
                                                            onClick={() => onClickSignOut(session)}
                                                        >
                                                            <SignOut className="size-4" />
                                                            {t("signOut")}
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TableCell colSpan={visibleColumnCount} className="p-0">
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
