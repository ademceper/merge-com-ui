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
import { FacetedFormFilter } from "@merge-rd/ui/components/faceted-filter/faceted-form-filter";
import {
    Tray,
    TrayHeader,
    TrayContent,
    TrayToolbar,
    useTray,
} from "@merge-rd/ui/components/tray";
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
import { DotsThreeIcon, TrashIcon } from "@phosphor-icons/react";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { getErrorDescription, getErrorMessage } from "@/shared/keycloak-ui-shared";
import type { RealmNameRepresentation } from "@/admin/api/realm";
import { useRealm } from "@/admin/app/providers/realm-context/realm-context";
import { useWhoAmI } from "@/admin/app/providers/whoami/who-am-i";
import { toDashboard } from "@/admin/shared/lib/route-helpers";
import { translationFormatter } from "@/admin/shared/lib/translation-formatter";
import { useDeleteRealms } from "@/admin/pages/realm/hooks/use-delete-realms";
import { useRealmNames } from "@/admin/pages/realm/hooks/use-realm-names";
import NewRealmForm from "@/admin/pages/realm/add/new-realm-form";

type RealmRow = RealmNameRepresentation & { id: string };

export function EnvironmentTray() {
    const { open, setOpen } = useTray();
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

    const [search, setSearch] = useState("");
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);

    useEffect(() => {
        if (open) {
            setSearch("");
            setCurrentPage(0);
        }
    }, [open]);

    const onDeleteConfirm = async () => {
        try {
            if (selected.some(({ name }) => name === "master")) {
                toast.warning(t("cantDeleteMasterRealm"));
            }
            const filtered = selected.filter(({ name }) => name !== "master");
            if (filtered.length === 0) {
                setSelected([]);
                return;
            }
            await deleteRealmsMut(filtered.map(({ name }) => name));
            toast.success(t("deletedSuccessRealmSetting"));
            if (selected.some(({ name }) => name === realm)) {
                navigate({ to: toDashboard({ realm: "master" }) as string });
            }
            refreshRealms();
            setSelected([]);
        } catch (error) {
            toast.error(t("deleteError", { error: getErrorMessage(error) }), {
                description: getErrorDescription(error)
            });
        }
    };

    const filteredRealms = useMemo(() => {
        if (!search) return realms;
        const lower = search.toLowerCase();
        return realms.filter(r => r.name?.toLowerCase().includes(lower));
    }, [realms, search]);

    const totalCount = filteredRealms.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const paginatedRealms = useMemo(() => {
        const start = currentPage * pageSize;
        return filteredRealms.slice(start, start + pageSize);
    }, [filteredRealms, currentPage, pageSize]);

    useEffect(() => {
        setCurrentPage(0);
    }, [search, pageSize]);

    const colSpan = 3;

    return (
        <>
            <AlertDialog
                open={selected.length > 0}
                onOpenChange={o => !o && setSelected([])}
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

            <Tray>
                <TrayHeader>{t("manageRealms")}</TrayHeader>
                <TrayContent>
                    <TrayToolbar>
                        <FacetedFormFilter
                            type="text"
                            size="small"
                            title={t("search")}
                            value={search}
                            onChange={value => setSearch(value)}
                            placeholder={t("search")}
                        />
                        {whoAmI.createRealm && (
                            <Button
                                size="sm"
                                onClick={() => setOpenNewRealm(true)}
                                data-testid="add-realm"
                            >
                                {t("createRealm")}
                            </Button>
                        )}
                    </TrayToolbar>

                    <Table className="table-fixed">
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[35%]">
                                    {t("realmName")}
                                </TableHead>
                                <TableHead className="w-[55%]">
                                    {t("displayName")}
                                </TableHead>
                                <TableHead className="w-[10%]" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedRealms.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={colSpan}
                                        className="text-center text-muted-foreground"
                                    >
                                        {t("emptyRealmList")}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedRealms.map(data => {
                                    const isMaster = data.name === "master";
                                    const isCurrent = data.name === realm;
                                    return (
                                        <TableRow
                                            key={data.id}
                                            className="cursor-pointer"
                                            onClick={() => {
                                                if (!isCurrent) {
                                                    navigate({
                                                        to: toDashboard({
                                                            realm: data.name
                                                        }) as string
                                                    });
                                                    setOpen(false);
                                                }
                                            }}
                                        >
                                            <TableCell className="truncate">
                                                <span className="inline-flex items-center gap-1">
                                                    {data.name}
                                                    {isCurrent && (
                                                        <Badge variant="secondary">
                                                            {t("currentRealm")}
                                                        </Badge>
                                                    )}
                                                </span>
                                            </TableCell>
                                            <TableCell className="truncate">
                                                {(translationFormatter(t)(
                                                    data.displayName
                                                ) as string) ?? "-"}
                                            </TableCell>
                                            <TableCell
                                                onClick={e => e.stopPropagation()}
                                            >
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon-sm"
                                                        >
                                                            <DotsThreeIcon
                                                                weight="bold"
                                                                className="size-4"
                                                            />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                            disabled={isMaster}
                                                            onClick={() =>
                                                                setSelected([data])
                                                            }
                                                            className="text-destructive focus:text-destructive"
                                                        >
                                                            <TrashIcon className="size-4 shrink-0" />
                                                            {t("delete")}
                                                        </DropdownMenuItem>
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
                                <TableCell colSpan={colSpan} className="p-0">
                                    <TablePaginationFooter
                                        pageSize={pageSize}
                                        onPageSizeChange={setPageSize}
                                        onPreviousPage={() =>
                                            setCurrentPage(p =>
                                                Math.max(0, p - 1)
                                            )
                                        }
                                        onNextPage={() =>
                                            setCurrentPage(p =>
                                                Math.min(totalPages - 1, p + 1)
                                            )
                                        }
                                        hasPreviousPage={currentPage > 0}
                                        hasNextPage={
                                            currentPage < totalPages - 1
                                        }
                                        totalCount={totalCount}
                                    />
                                </TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </TrayContent>
            </Tray>
        </>
    );
}
