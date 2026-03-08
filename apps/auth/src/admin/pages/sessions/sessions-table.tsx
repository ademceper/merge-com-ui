import type UserSessionRepresentation from "@keycloak/keycloak-admin-client/lib/defs/userSessionRepresentation";
import { useTranslation } from "@merge-rd/i18n";
import { Badge } from "@merge-rd/ui/components/badge";
import { Button } from "@merge-rd/ui/components/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@merge-rd/ui/components/tooltip";
import { Info, ProhibitInset, SignOut } from "@phosphor-icons/react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useMemo } from "react";
import { toast } from "sonner";
import {
    type ColumnDef,
    DataTable,
    DataTableRowActions
} from "@/admin/shared/ui/data-table";
import {
    getErrorDescription,
    getErrorMessage,
    useEnvironment
} from "../../../shared/keycloak-ui-shared";
import { useRealm } from "../../app/providers/realm-context/realm-context";
import { useDeleteSession } from "./hooks/use-delete-session";
import { useLogoutUser } from "./hooks/use-logout-user";
import { useWhoAmI } from "../../app/providers/whoami/who-am-i";
import { toClient } from "../../shared/lib/routes/clients";
import { toUser, toUsers } from "../../shared/lib/routes/user";
import { useFormatDate } from "../../shared/lib/use-format-date";
import { useConfirmDialog } from "../../shared/ui/confirm-dialog/confirm-dialog";
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

    const columns: ColumnDef<UserSessionRepresentation>[] = useMemo(() => {
        const cols: ColumnDef<UserSessionRepresentation>[] = [
            {
                accessorKey: "username",
                header: t("user"),
                enableHiding: false,
                cell: ({ row }) => {
                    const r = row.original;
                    return (
                        <Link
                            to={
                                toUser({
                                    realm,
                                    id: r.userId!,
                                    tab: "sessions"
                                }) as string
                            }
                            className="text-primary hover:underline"
                        >
                            {r.username}
                            {r.transientUser && (
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
                    );
                }
            },
            {
                accessorKey: "type",
                header: t("type")
            },
            {
                accessorKey: "start",
                header: t("started"),
                cell: ({ row }) => formatDate(new Date(row.original.start!))
            },
            {
                accessorKey: "lastAccess",
                header: t("lastAccess"),
                cell: ({ row }) => formatDate(new Date(row.original.lastAccess!))
            },
            {
                accessorKey: "ipAddress",
                header: t("ipAddress")
            },
            {
                accessorKey: "clients",
                header: t("clients"),
                cell: ({ row }) => (
                    <div className="flex flex-wrap gap-x-2 gap-y-1">
                        {Object.entries(row.original.clients ?? {}).map(
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
                )
            },
            {
                id: "actions",
                header: "",
                size: 50,
                enableHiding: false,
                cell: ({ row }) => {
                    const session = row.original as UserSessionRepresentation & {
                        type?: string;
                    };
                    const isOffline =
                        session.type === "Offline" || session.type === "OFFLINE";
                    return (
                        <DataTableRowActions row={row}>
                            {isOffline ? (
                                <button
                                    type="button"
                                    className="flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                                    onClick={() => onClickRevoke(session)}
                                >
                                    <ProhibitInset className="size-4 shrink-0" />
                                    {t("revoke")}
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    className="flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                                    onClick={() => onClickSignOut(session)}
                                >
                                    <SignOut className="size-4 shrink-0" />
                                    {t("signOut")}
                                </button>
                            )}
                        </DataTableRowActions>
                    );
                }
            }
        ];
        if (hiddenColumns.length === 0) return cols;
        return cols.filter(col => {
            const key = (
                col as ColumnDef<UserSessionRepresentation> & { accessorKey?: string }
            ).accessorKey;
            return !key || !hiddenColumns.includes(key as ColumnName);
        });
    }, [realm, hiddenColumns, t, formatDate]);

    return (
        <>
            <LogoutConfirm />
            <DataTable<UserSessionRepresentation>
                columns={columns}
                data={sessions}
                searchColumnId="username"
                searchPlaceholder={t("searchForSession")}
                emptyMessage={emptyMessage ?? t("noSessions")}
                toolbar={
                    toolbar || logoutUser ? (
                        <>
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
                        </>
                    ) : undefined
                }
            />
        </>
    );
}
