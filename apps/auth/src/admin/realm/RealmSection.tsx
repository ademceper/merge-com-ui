import { NetworkError } from "@keycloak/keycloak-admin-client";
import {
    getErrorDescription,
    getErrorMessage,
} from "../../shared/keycloak-ui-shared";
import { toast } from "@merge/ui/components/sonner";
import { Badge } from "@merge/ui/components/badge";
import { Button } from "@merge/ui/components/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@merge/ui/components/dropdown-menu";
import {
    DataTable,
    DataTableRowActions,
    type ColumnDef,
} from "@merge/ui/components/table";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@merge/ui/components/popover";
import { Trash } from "@phosphor-icons/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { useAdminClient } from "../admin-client";
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
import { ViewHeader } from "../components/view-header/ViewHeader";
import { fetchAdminUI } from "../context/auth/admin-ui-endpoint";
import { useRealm } from "../context/realm-context/RealmContext";
import { useRecentRealms } from "../context/RecentRealms";
import { useWhoAmI } from "../context/whoami/WhoAmI";
import { translationFormatter } from "../utils/translationFormatter";
import NewRealmForm from "./add/NewRealmForm";
import { toRealm } from "./RealmRoutes";
import { toDashboard } from "../dashboard/routes/Dashboard";

export type RealmNameRepresentation = {
    name: string;
    displayName?: string;
};

type RealmRow = RealmNameRepresentation & { id: string };

const RecentRealmsDropdown = () => {
    const { t } = useTranslation();
    const recentRealms = useRecentRealms();

    if (recentRealms.length < 3) return null;
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    data-testid="kebab"
                    aria-label="Recent realms"
                >
                    {t("recentRealms")}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {recentRealms.map(({ name }) => (
                    <DropdownMenuItem key={name} asChild>
                        <Link to={toDashboard({ realm: name })}>{name}</Link>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default function RealmSection() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { whoAmI } = useWhoAmI();
    const { realm } = useRealm();
    const { adminClient } = useAdminClient();

    const [realms, setRealms] = useState<RealmRow[]>([]);
    const [selected, setSelected] = useState<RealmRow[]>([]);
    const [openNewRealm, setOpenNewRealm] = useState(false);
    const [key, setKey] = useState(0);
    const refresh = useCallback(() => setKey((k) => k + 1), []);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const result = await fetchAdminUI<RealmNameRepresentation[]>(
                    adminClient,
                    "ui-ext/realms/names",
                    { first: "0", max: "1000" },
                );
                if (cancelled) return;
                setRealms(
                    (result ?? []).map((r) => ({ ...r, id: r.name })),
                );
            } catch (error) {
                if (
                    error instanceof NetworkError &&
                    error.response.status < 500
                ) {
                    if (!cancelled) setRealms([]);
                } else if (!cancelled) {
                    setRealms([]);
                }
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [key, adminClient]);

    const onDeleteConfirm = async () => {
        try {
            if (
                selected.filter(({ name }) => name === "master").length > 0
            ) {
                toast.warning(t("cantDeleteMasterRealm"));
            }
            const filtered = selected.filter(
                ({ name }) => name !== "master",
            );
            if (filtered.length === 0) {
                setSelected([]);
                return;
            }
            await Promise.all(
                filtered.map(({ name: realmName }) =>
                    adminClient.realms.del({ realm: realmName }),
                ),
            );
            toast.success(t("deletedSuccessRealmSetting"));
            if (selected.filter(({ name }) => name === realm).length > 0) {
                navigate(toRealm({ realm: "master" }));
            }
            refresh();
            setSelected([]);
        } catch (error) {
            toast.error(
                t("deleteError", { error: getErrorMessage(error) }),
                { description: getErrorDescription(error) },
            );
        }
    };

    const columns: ColumnDef<RealmRow>[] = useMemo(
        () => [
            {
                accessorKey: "name",
                header: t("realmName"),
                cell: ({ row }) => {
                    const name = row.original.name;
                    if (name !== realm) {
                        return (
                            <Link
                                to={toDashboard({ realm: name })}
                                className="font-medium text-primary hover:underline"
                            >
                                {name}
                            </Link>
                        );
                    }
                    return (
                        <Popover>
                            <PopoverTrigger asChild>
                                <span className="inline-flex cursor-help items-center gap-1">
                                    {name}{" "}
                                    <Badge variant="secondary">
                                        {t("currentRealm")}
                                    </Badge>
                                </span>
                            </PopoverTrigger>
                            <PopoverContent className="max-w-xs">
                                {t("currentRealmExplain")}
                            </PopoverContent>
                        </Popover>
                    );
                },
            },
            {
                accessorKey: "displayName",
                header: t("displayName"),
                cell: ({ row }) =>
                    (translationFormatter(t)(row.original.displayName) as string) ??
                    "-",
            },
            {
                id: "actions",
                header: "",
                size: 50,
                enableHiding: false,
                cell: ({ row }) => {
                    const data = row.original;
                    const isMaster = data.name === "master";
                    return (
                        <DataTableRowActions row={row}>
                            <button
                                type="button"
                                className="flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left text-sm text-destructive hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                                disabled={isMaster}
                                onClick={() => setSelected([data])}
                            >
                                <Trash className="size-4 shrink-0" />
                                {t("delete")}
                            </button>
                        </DataTableRowActions>
                    );
                },
            },
        ],
        [t, realm],
    );

    return (
        <>
            <AlertDialog open={selected.length > 0} onOpenChange={(open) => !open && setSelected([])}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {t("deleteConfirmRealm", {
                                count: selected.length,
                                name: selected[0]?.name,
                            })}
                        </AlertDialogTitle>
                        <AlertDialogDescription>{t("deleteConfirmRealmSetting")}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                        <AlertDialogAction variant="destructive" data-testid="confirm" onClick={onDeleteConfirm}>
                            {t("delete")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            {openNewRealm && (
                <NewRealmForm
                    onClose={() => {
                        setOpenNewRealm(false);
                        refresh();
                    }}
                />
            )}
            <ViewHeader titleKey="manageRealms" divider={false} />
            <div className="space-y-4 py-6">
                <DataTable<RealmRow>
                    columns={columns}
                    data={realms}
                    searchColumnId="name"
                    searchPlaceholder={t("search")}
                    emptyMessage={t("emptyRealmList")}
                    toolbar={
                        <div className="flex flex-wrap items-center gap-2">
                            {whoAmI.createRealm && (
                                <Button
                                    onClick={() => setOpenNewRealm(true)}
                                    data-testid="add-realm"
                                    variant="default"
                                    size="sm"
                                >
                                    {t("createRealm")}
                                </Button>
                            )}
                            <RecentRealmsDropdown />
                        </div>
                    }
                />
            </div>
        </>
    );
}
