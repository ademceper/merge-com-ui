import type ComponentRepresentation from "@keycloak/keycloak-admin-client/lib/defs/componentRepresentation";
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
import { CardTitle } from "@merge-rd/ui/components/card";
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
import { Database, DotsThree, Trash } from "@phosphor-icons/react";
import { useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { getErrorDescription, getErrorMessage } from "@/shared/keycloak-ui-shared";
import { useRealm } from "@/admin/app/providers/realm-context/realm-context";
import { useServerInfo } from "@/admin/app/providers/server-info/server-info-provider";
import {
    toCustomUserFederation,
    toNewCustomUserFederation,
    toUserFederationKerberos,
    toUserFederationLdap
} from "@/admin/shared/lib/routes/user-federation";
import { toUpperCase } from "@/admin/shared/lib/util";
import { ClickableCard } from "@/admin/shared/ui/keycloak-card/clickable-card";
import { useDeleteComponent } from "./hooks/use-delete-component";
import { useUserFederationList } from "./hooks/use-user-federation-list";
import { ManagePriorityDialog } from "./manage-priority-dialog";

export function UserFederationSection() {
    const { t } = useTranslation();
    const { realm, realmRepresentation } = useRealm();
    const navigate = useNavigate();

    const [manageDisplayDialog, setManageDisplayDialog] = useState(false);
    const [selectedComponent, setSelectedComponent] = useState<ComponentRepresentation>();
    const [search, setSearch] = useState("");
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);
    const [sortBy, setSortBy] = useState<"name" | null>(null);
    const [sortDirection, setSortDirection] = useState<TableSortDirection>(false);

    const providers =
        useServerInfo().componentTypes?.["org.keycloak.storage.UserStorageProvider"] ??
        [];

    const { data: userFederations = [] } = useUserFederationList(realmRepresentation?.id);
    const { mutateAsync: deleteComponentMut } = useDeleteComponent();

    const toDetails = useCallback(
        (providerId: string, id: string) => {
            switch (providerId) {
                case "ldap":
                    return toUserFederationLdap({ realm, id });
                case "kerberos":
                    return toUserFederationKerberos({ realm, id });
                default:
                    return toCustomUserFederation({ realm, providerId, id });
            }
        },
        [realm]
    );

    const toggleSort = (column: "name") => {
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

    useEffect(() => {
        setCurrentPage(0);
    }, [search, pageSize]);

    const filteredFederations = useMemo(() => {
        let result = [...userFederations];
        if (search) {
            const lower = search.toLowerCase();
            result = result.filter(f => f.name?.toLowerCase().includes(lower));
        }
        if (sortBy && sortDirection) {
            const dir = sortDirection === "asc" ? 1 : -1;
            result.sort((a, b) => {
                const aVal = (a[sortBy] ?? "").toLowerCase();
                const bVal = (b[sortBy] ?? "").toLowerCase();
                return aVal < bVal ? -dir : aVal > bVal ? dir : 0;
            });
        }
        return result;
    }, [userFederations, search, sortBy, sortDirection]);

    const totalCount = filteredFederations.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const paginatedFederations = useMemo(() => {
        const start = currentPage * pageSize;
        return filteredFederations.slice(start, start + pageSize);
    }, [filteredFederations, currentPage, pageSize]);

    const onDeleteConfirm = async () => {
        if (!selectedComponent?.id) return;
        try {
            await deleteComponentMut(selectedComponent.id);
            setSelectedComponent(undefined);
            toast.success(t("userFedDeletedSuccess"));
        } catch (error) {
            toast.error(
                t("userFedDeleteError", {
                    error: getErrorMessage(error)
                }),
                { description: getErrorDescription(error) }
            );
        }
    };

    const addProviderDropdownItems = useMemo(
        () =>
            providers.map(p => (
                <DropdownMenuItem
                    key={p.id}
                    data-testid={p.id}
                    onClick={() =>
                        navigate({
                            to: toNewCustomUserFederation({
                                realm,
                                providerId: p.id!
                            }) as string
                        })
                    }
                >
                    {p.id?.toUpperCase() === "LDAP"
                        ? p.id.toUpperCase()
                        : toUpperCase(p.id)}
                </DropdownMenuItem>
            )),
        [providers, realm, navigate]
    );

    return (
        <>
            <AlertDialog
                open={!!selectedComponent}
                onOpenChange={open => !open && setSelectedComponent(undefined)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {t("userFedDeleteConfirmTitle")}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("userFedDeleteConfirm")}
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
            {manageDisplayDialog && userFederations.length > 0 && (
                <ManagePriorityDialog
                    onClose={() => setManageDisplayDialog(false)}
                    components={userFederations.filter(
                        p => p.config?.enabled?.[0] !== "false"
                    )}
                />
            )}
            <div className="flex h-full w-full flex-col">
                {userFederations.length > 0 ? (
                    <>
                        <div className="flex items-center justify-between gap-2 py-2.5">
                            <FacetedFormFilter
                                type="text"
                                size="small"
                                title={t("search")}
                                value={search}
                                onChange={value => setSearch(value)}
                                placeholder={t("searchForProvider")}
                            />
                            <div className="flex flex-wrap items-center gap-2">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            data-testid="addProviderDropdown"
                                            variant="default"
                                            size="sm"
                                        >
                                            {t("addNewProvider")}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        {addProviderDropdownItems}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <Button
                                    data-testid="managePriorities"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setManageDisplayDialog(true)}
                                >
                                    {t("managePriorities")}
                                </Button>
                            </div>
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
                                        {t("name")}
                                    </TableHead>
                                    <TableHead className="w-[25%]">
                                        {t("providerDetails")}
                                    </TableHead>
                                    <TableHead className="w-[25%]">
                                        {t("status")}
                                    </TableHead>
                                    <TableHead className="w-[20%]" />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedFederations.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={4}
                                            className="text-center text-muted-foreground"
                                        >
                                            {t("noUserFederationProviders")}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedFederations.map(federation => {
                                        const enabled =
                                            federation.config?.enabled?.[0] !== "false";
                                        return (
                                            <TableRow
                                                key={federation.id}
                                                className="cursor-pointer"
                                                onClick={() =>
                                                    navigate({
                                                        to: toDetails(
                                                            federation.providerId!,
                                                            federation.id!
                                                        ) as string
                                                    })
                                                }
                                            >
                                                <TableCell className="truncate font-medium">
                                                    {federation.name ?? "-"}
                                                </TableCell>
                                                <TableCell className="truncate">
                                                    {toUpperCase(
                                                        federation.providerId ?? ""
                                                    ) || "-"}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={
                                                            enabled
                                                                ? "default"
                                                                : "secondary"
                                                        }
                                                    >
                                                        {enabled
                                                            ? t("enabled")
                                                            : t("disabled")}
                                                    </Badge>
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
                                                                <DotsThree
                                                                    weight="bold"
                                                                    className="size-4"
                                                                />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem
                                                                className="text-destructive focus:text-destructive"
                                                                onClick={() =>
                                                                    setSelectedComponent(
                                                                        federation
                                                                    )
                                                                }
                                                            >
                                                                <Trash className="size-4" />
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
                                    <TableCell colSpan={4} className="p-0">
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
                    </>
                ) : (
                    <div className="p-6">
                        <p className="text-muted-foreground">{t("getStarted")}</p>
                        <h2 className="mt-6 text-lg font-semibold">
                            {t("add-providers")}
                        </h2>
                        <hr className="my-4 border-border" />
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {providers.map(p => (
                                <ClickableCard
                                    key={p.id}
                                    data-testid={`${p.id}-card`}
                                    onClick={() =>
                                        navigate({
                                            to: toNewCustomUserFederation({
                                                realm,
                                                providerId: p.id!
                                            }) as string
                                        })
                                    }
                                >
                                    <CardTitle className="flex items-center gap-2">
                                        <Database className="size-6 shrink-0" />
                                        <span>
                                            {t("addProvider", {
                                                provider: toUpperCase(p.id!),
                                                count: 4
                                            })}
                                        </span>
                                    </CardTitle>
                                </ClickableCard>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
