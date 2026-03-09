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
import { Badge } from "@merge-rd/ui/components/badge";
import { Button } from "@merge-rd/ui/components/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@merge-rd/ui/components/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@merge-rd/ui/components/popover";
import { Trash } from "@phosphor-icons/react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
    type ColumnDef,
    DataTable,
    DataTableRowActions
} from "@/admin/shared/ui/data-table";
import { getErrorDescription, getErrorMessage } from "@/shared/keycloak-ui-shared";
import type { RealmNameRepresentation } from "@/admin/api/realm";
import { useRealm } from "@/admin/app/providers/realm-context/realm-context";
import { useRecentRealms } from "@/admin/app/providers/recent-realms";
import { useWhoAmI } from "@/admin/app/providers/whoami/who-am-i";
import { toDashboard } from "@/admin/shared/lib/route-helpers";
import { translationFormatter } from "@/admin/shared/lib/translationFormatter";
import NewRealmForm from "./add/new-realm-form";
import { useDeleteRealms } from "./hooks/use-delete-realms";
import { useRealmNames } from "./hooks/use-realm-names";
import { toRealm } from "./realm-routes";

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
                        <Link to={toDashboard({ realm: name }) as string}>{name}</Link>
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

    const { data: realmNames = [], refetch: refreshRealms } = useRealmNames();
    const realms: RealmRow[] = useMemo(
        () => realmNames.map(r => ({ ...r, id: r.name })),
        [realmNames]
    );
    const [selected, setSelected] = useState<RealmRow[]>([]);
    const [openNewRealm, setOpenNewRealm] = useState(false);
    const { mutateAsync: deleteRealmsMut } = useDeleteRealms();

    const onDeleteConfirm = async () => {
        try {
            if (selected.filter(({ name }) => name === "master").length > 0) {
                toast.warning(t("cantDeleteMasterRealm"));
            }
            const filtered = selected.filter(({ name }) => name !== "master");
            if (filtered.length === 0) {
                setSelected([]);
                return;
            }
            await deleteRealmsMut(filtered.map(({ name }) => name));
            toast.success(t("deletedSuccessRealmSetting"));
            if (selected.filter(({ name }) => name === realm).length > 0) {
                navigate({ to: toRealm({ realm: "master" }) as string });
            }
            refreshRealms();
            setSelected([]);
        } catch (error) {
            toast.error(t("deleteError", { error: getErrorMessage(error) }), {
                description: getErrorDescription(error)
            });
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
                                to={toDashboard({ realm: name }) as string}
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
                                    <Badge variant="secondary">{t("currentRealm")}</Badge>
                                </span>
                            </PopoverTrigger>
                            <PopoverContent className="max-w-xs">
                                {t("currentRealmExplain")}
                            </PopoverContent>
                        </Popover>
                    );
                }
            },
            {
                accessorKey: "displayName",
                header: t("displayName"),
                cell: ({ row }) =>
                    (translationFormatter(t)(row.original.displayName) as string) ?? "-"
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
                }
            }
        ],
        [t, realm]
    );

    return (
        <>
            <AlertDialog
                open={selected.length > 0}
                onOpenChange={open => !open && setSelected([])}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {t("deleteConfirmRealm", {
                                count: selected.length,
                                name: selected[0]?.name
                            })}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("deleteConfirmRealmSetting")}
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
            {openNewRealm && (
                <NewRealmForm
                    onClose={() => {
                        setOpenNewRealm(false);
                        refreshRealms();
                    }}
                />
            )}
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
