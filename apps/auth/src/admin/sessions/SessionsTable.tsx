import type UserSessionRepresentation from "@keycloak/keycloak-admin-client/lib/defs/userSessionRepresentation";
import { useEnvironment } from "../../shared/keycloak-ui-shared";
import { Badge } from "@merge/ui/components/badge";
import { Button } from "@merge/ui/components/button";
import {
    DataTable,
    DataTableRowActions,
    type ColumnDef
} from "@merge/ui/components/table";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger
} from "@merge/ui/components/tooltip";
import { Info, SignOut, ProhibitInset } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link, useMatch, useNavigate } from "react-router-dom";
import { useAdminClient } from "../admin-client";
import { getErrorDescription, getErrorMessage } from "../../shared/keycloak-ui-shared";
import { toast } from "@merge/ui/components/sonner";
import { useConfirmDialog } from "../components/confirm-dialog/ConfirmDialog";
import { useRealm } from "../context/realm-context/RealmContext";
import { useWhoAmI } from "../context/whoami/WhoAmI";
import { toClient } from "../clients/routes/Client";
import { UserRoute, toUser } from "../user/routes/User";
import { toUsers } from "../user/routes/Users";
import { isLightweightUser } from "../user/utils";
import useFormatDate from "../utils/useFormatDate";

export type ColumnName = "username" | "start" | "lastAccess" | "clients" | "type" | "ipAddress";

export type SessionsTableProps = {
    sessions: UserSessionRepresentation[];
    refresh: () => void;
    toolbar?: ReactNode;
    hiddenColumns?: ColumnName[];
    emptyMessage?: string;
    logoutUser?: string;
};

export default function SessionsTable({
    sessions,
    refresh,
    toolbar,
    hiddenColumns = [],
    emptyMessage,
    logoutUser
}: SessionsTableProps) {
    const { keycloak } = useEnvironment();
    const { adminClient } = useAdminClient();
    const { realm } = useRealm();
    const { whoAmI } = useWhoAmI();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const formatDate = useFormatDate();
    const refreshInternal = () => refresh();
    const isOnUserPage = !!useMatch(UserRoute.path);

    const [toggleLogoutDialog, LogoutConfirm] = useConfirmDialog({
        titleKey: "logoutAllSessions",
        messageKey: "logoutAllDescription",
        continueButtonLabel: "confirm",
        onConfirm: async () => {
            try {
                await adminClient.users.logout({ id: logoutUser! });
                if (isOnUserPage && logoutUser && isLightweightUser(logoutUser)) {
                    navigate(toUsers({ realm }));
                } else {
                    refreshInternal();
                }
            } catch (error) {
                toast.error(t("logoutAllSessionsError", { error: getErrorMessage(error) }), {
                    description: getErrorDescription(error)
                });
            }
        }
    });

    const onClickRevoke = async (session: UserSessionRepresentation) => {
        await adminClient.realms.deleteSession({
            realm,
            session: session.id!,
            isOffline: true
        });
        refreshInternal();
    };

    const onClickSignOut = async (session: UserSessionRepresentation) => {
        await adminClient.realms.deleteSession({
            realm,
            session: session.id!,
            isOffline: false
        });
        if (session.userId === whoAmI.userId) {
            await keycloak.logout({ redirectUri: "" });
        } else if (isOnUserPage && session.userId && isLightweightUser(session.userId)) {
            navigate(toUsers({ realm }));
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
                            to={toUser({ realm, id: r.userId!, tab: "sessions" })}
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
                                        <TooltipContent>{t("transientUserTooltip")}</TooltipContent>
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
                        {Object.entries(row.original.clients ?? {}).map(([clientId, client]) => (
                            <Link
                                key={clientId}
                                to={toClient({ realm, clientId, tab: "sessions" })}
                                className="text-primary hover:underline"
                            >
                                {client}
                            </Link>
                        ))}
                    </div>
                )
            },
            {
                id: "actions",
                header: "",
                size: 50,
                enableHiding: false,
                cell: ({ row }) => {
                    const session = row.original as UserSessionRepresentation & { type?: string };
                    const isOffline = session.type === "Offline" || session.type === "OFFLINE";
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
        return cols.filter((col) => {
        const key = (col as ColumnDef<UserSessionRepresentation> & { accessorKey?: string }).accessorKey;
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
                                    <span className="hidden sm:inline">{t("logoutAllSessions")}</span>
                                </Button>
                            )}
                        </>
                    ) : undefined
                }
            />
        </>
    );
}
