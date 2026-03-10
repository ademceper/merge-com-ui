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
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { getErrorDescription, getErrorMessage } from "@/shared/keycloak-ui-shared";
import { useLocaleSort, mapByKey } from "@/admin/shared/lib/use-locale-sort";
import { useDeleteClientScope } from "./hooks/use-delete-client-scope";
import {
    type AllClientScopeType,
    CellDropdown,
    type ClientScopeDefaultOptionalType,
    changeScope
} from "@/admin/shared/ui/client-scope/client-scope-types";
import type { Row } from "../clients/scopes/client-scopes";
import { getProtocolName } from "../clients/utils";
import { AddClientScopeDialog } from "./add-client-scope-dialog";
import { useClientScopes } from "./hooks/use-client-scopes";
import { EditClientScopeDialog } from "./edit-client-scope-dialog";

type TypeSelectorProps = ClientScopeDefaultOptionalType & {
    refresh: () => void;
    className?: string;
};

function TypeSelector(scope: TypeSelectorProps) {
    const { t } = useTranslation();
    return (
        <CellDropdown
            clientScope={scope}
            type={scope.type}
            all
            className={scope.className}
            onSelect={async value => {
                try {
                    await changeScope(scope, value as AllClientScopeType);
                    toast.success(t("clientScopeSuccess"));
                    scope.refresh();
                } catch (error) {
                    toast.error(
                        t("clientScopeError", { error: getErrorMessage(error) }),
                        {
                            description: getErrorDescription(error)
                        }
                    );
                }
            }}
        />
    );
}

export function ClientScopesSection() {
    const { t } = useTranslation();
    const localeSort = useLocaleSort();

    const { data: rawClientScopes = [], refetch: refetchScopes } = useClientScopes();
    const clientScopes = localeSort(rawClientScopes as Row[], mapByKey("name"));
    const refresh = () => {
        refetchScopes();
    };
    const [selectedScope, setSelectedScope] = useState<ClientScopeDefaultOptionalType>();
    const [editScopeId, setEditScopeId] = useState<string | null>(null);

    const { mutateAsync: deleteScope } = useDeleteClientScope();

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

    const filteredScopes = useMemo(() => {
        let result = clientScopes;
        if (search) {
            const lower = search.toLowerCase();
            result = result.filter(s => s.name?.toLowerCase().includes(lower));
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
    }, [clientScopes, search, sortBy, sortDirection]);

    const totalCount = filteredScopes.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const paginatedScopes = useMemo(() => {
        const start = currentPage * pageSize;
        return filteredScopes.slice(start, start + pageSize);
    }, [filteredScopes, currentPage, pageSize]);

    useEffect(() => {
        setCurrentPage(0);
    }, [search, pageSize]);

    const onDeleteConfirm = async () => {
        if (!selectedScope?.id) return;
        const currentCount = clientScopes.length;
        if (currentCount <= 1) {
            toast.error(t("notAllowedToDeleteAllClientScopes"));
            setSelectedScope(undefined);
            return;
        }
        try {
            await deleteScope(selectedScope);
            toast.success(t("deletedSuccessClientScope"));
            setSelectedScope(undefined);
            refresh();
        } catch (error) {
            toast.error(t("deleteErrorClientScope", { error: getErrorMessage(error) }), {
                description: getErrorDescription(error)
            });
        }
    };

    return (
        <>
            <AlertDialog
                open={!!selectedScope}
                onOpenChange={open => !open && setSelectedScope(undefined)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {t("deleteClientScope", {
                                count: 1,
                                name: selectedScope?.name
                            })}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("deleteConfirmClientScopes")}
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

            <EditClientScopeDialog
                open={!!editScopeId}
                onOpenChange={open => !open && setEditScopeId(null)}
                scopeId={editScopeId}
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
                        placeholder={t("searchForClientScope")}
                    />
                    <AddClientScopeDialog
                        trigger={
                            <Button
                                type="button"
                                data-testid="createClientScope"
                                variant="default"
                                size="sm"
                            >
                                <Plus className="size-4" />
                                <span>{t("createClientScope")}</span>
                            </Button>
                        }
                        onSuccess={refresh}
                    />
                </div>

                <Table className="table-fixed">
                    <TableHeader>
                        <TableRow>
                            <TableHead
                                className="w-[25%]"
                                sortable
                                sortDirection={sortBy === "name" ? sortDirection : false}
                                onSort={() => toggleSort("name")}
                            >
                                {t("name")}
                            </TableHead>
                            <TableHead className="w-[15%]">{t("assignedType")}</TableHead>
                            <TableHead className="w-[15%]">{t("protocol")}</TableHead>
                            <TableHead className="w-[10%]">{t("displayOrder")}</TableHead>
                            <TableHead
                                className="w-[25%]"
                                sortable
                                sortDirection={sortBy === "description" ? sortDirection : false}
                                onSort={() => toggleSort("description")}
                            >
                                {t("description")}
                            </TableHead>
                            <TableHead className="w-[10%]" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedScopes.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={6}
                                    className="text-center text-muted-foreground"
                                >
                                    {t("emptyClientScopes")}
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedScopes.map(scope => (
                                <TableRow
                                    key={scope.id}
                                    className="cursor-pointer"
                                    onClick={() => setEditScopeId(scope.id!)}
                                >
                                    <TableCell className="truncate">
                                        <button
                                            type="button"
                                            className="text-primary hover:underline text-left"
                                            onClick={e => {
                                                e.stopPropagation();
                                                setEditScopeId(scope.id!);
                                            }}
                                        >
                                            {scope.name}
                                        </button>
                                    </TableCell>
                                    <TableCell onClick={e => e.stopPropagation()}>
                                        <TypeSelector
                                            {...scope}
                                            refresh={refresh}
                                            className="h-8 min-h-8 w-auto min-w-[100px] border border-input bg-muted/50 py-1 px-2 text-sm"
                                        />
                                    </TableCell>
                                    <TableCell className="truncate">
                                        {getProtocolName(
                                            t,
                                            scope.protocol ?? "openid-connect"
                                        )}
                                    </TableCell>
                                    <TableCell className="truncate">
                                        {scope.attributes?.["gui.order"] ?? "-"}
                                    </TableCell>
                                    <TableCell className="truncate">
                                        {scope.description || "-"}
                                    </TableCell>
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
                                                        setEditScopeId(scope.id!)
                                                    }
                                                >
                                                    <PencilSimple className="size-4" />
                                                    {t("edit")}
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-destructive focus:text-destructive"
                                                    onClick={() =>
                                                        setSelectedScope(scope)
                                                    }
                                                >
                                                    <Trash className="size-4" />
                                                    {t("delete")}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TableCell colSpan={6} className="p-0">
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
