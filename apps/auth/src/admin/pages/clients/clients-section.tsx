import type ClientRepresentation from "@keycloak/keycloak-admin-client/lib/defs/clientRepresentation";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@merge-rd/ui/components/tabs";
import { DotsThree, DownloadSimple, PencilSimple, Plus, Trash } from "@phosphor-icons/react";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { getErrorDescription, getErrorMessage } from "@/shared/keycloak-ui-shared";
import { useAccess } from "@/admin/app/providers/access/access";
import { useRealm } from "@/admin/app/providers/realm-context/realm-context";
import type { ClientRegistrationTab, ClientsTab } from "@/admin/shared/lib/routes/clients";
import {
    toClient,
    toClientRegistration,
    toClients
} from "@/admin/shared/lib/routes/clients";
import { translationFormatter } from "@/admin/shared/lib/translation-formatter";
import { exportClient } from "@/admin/shared/lib/util";
import { AddClientDialog } from "./add/add-client-dialog";
import { useClients } from "./hooks/use-clients";
import { useDeleteClient } from "./hooks/use-delete-client";
import { InitialAccessTokenList } from "./initial-access/initial-access-token-list";
import { ClientRegistration } from "./registration/client-registration";
import { getProtocolName, isRealmClient } from "./utils";

export function ClientsSection() {
    const { t } = useTranslation();
    const { realm } = useRealm();
    const navigate = useNavigate();
    const { tab, subTab } = useParams({ strict: false }) as {
        tab?: string;
        subTab?: string;
    };

    const { data: clients = [] } = useClients();
    const [selectedClient, setSelectedClient] = useState<ClientRepresentation>();
    const { mutateAsync: deleteClient } = useDeleteClient();

    const { hasAccess } = useAccess();
    const isManager = hasAccess("manage-clients");

    const [search, setSearch] = useState("");
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);
    const [sortBy, setSortBy] = useState<"clientId" | "name" | "description" | null>(null);
    const [sortDirection, setSortDirection] = useState<TableSortDirection>(false);

    const toggleSort = (column: "clientId" | "name" | "description") => {
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

    const filteredClients = useMemo(() => {
        let result = clients;
        if (search) {
            const lower = search.toLowerCase();
            result = result.filter(c => c.clientId?.toLowerCase().includes(lower));
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
    }, [clients, search, sortBy, sortDirection]);

    const totalCount = filteredClients.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const paginatedClients = useMemo(() => {
        const start = currentPage * pageSize;
        return filteredClients.slice(start, start + pageSize);
    }, [filteredClients, currentPage, pageSize]);

    useEffect(() => {
        setCurrentPage(0);
    }, [search, pageSize]);

    const onDeleteConfirm = useCallback(async () => {
        if (!selectedClient?.id) return;
        try {
            await deleteClient(selectedClient.id);
            setSelectedClient(undefined);
            toast.success(t("clientDeletedSuccess"));
        } catch (error) {
            toast.error(t("clientDeleteError", { error: getErrorMessage(error) }), {
                description: getErrorDescription(error)
            });
        }
    }, [selectedClient?.id, deleteClient, t]);

    const isClientRegistration = Boolean(subTab);
    const clientRegistrationTab: ClientRegistrationTab =
        subTab === "authenticated" ? "authenticated" : "anonymous";

    const currentTab: ClientsTab =
        tab === "initial-access-token" || tab === "client-registration" ? tab : "list";

    const renderClientList = () => (
        <div className="flex h-full w-full flex-col">
            <div className="flex items-center justify-between gap-2 py-2.5">
                <FacetedFormFilter
                    type="text"
                    size="small"
                    title={t("search")}
                    value={search}
                    onChange={value => setSearch(value)}
                    placeholder={t("searchForClient")}
                />
                <AddClientDialog
                    trigger={
                        <Button
                            type="button"
                            data-testid="createClient"
                            variant="default"
                            size="sm"
                        >
                            <Plus className="size-4" />
                            <span>{t("createClient")}</span>
                        </Button>
                    }
                />
            </div>

            <Table className="table-fixed">
                <TableHeader>
                    <TableRow>
                        <TableHead
                            className="w-[25%]"
                            sortable
                            sortDirection={sortBy === "clientId" ? sortDirection : false}
                            onSort={() => toggleSort("clientId")}
                        >
                            {t("clientId")}
                        </TableHead>
                        <TableHead
                            className="w-[20%]"
                            sortable
                            sortDirection={sortBy === "name" ? sortDirection : false}
                            onSort={() => toggleSort("name")}
                        >
                            {t("clientName")}
                        </TableHead>
                        <TableHead className="w-[15%]">{t("type")}</TableHead>
                        <TableHead
                            className="w-[30%]"
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
                    {paginatedClients.length === 0 ? (
                        <TableRow>
                            <TableCell
                                colSpan={5}
                                className="text-center text-muted-foreground"
                            >
                                {t("noClients")}
                            </TableCell>
                        </TableRow>
                    ) : (
                        paginatedClients.map(client => (
                            <TableRow
                                key={client.id}
                                className="cursor-pointer"
                                onClick={() =>
                                    navigate({
                                        to: toClient({
                                            realm,
                                            clientId: client.id ?? "",
                                            tab: "settings"
                                        }) as string
                                    })
                                }
                            >
                                <TableCell className="truncate">
                                    <span className="flex items-center gap-2">
                                        {client.clientId}
                                        {!client.enabled && (
                                            <Badge variant="secondary">
                                                {t("disabled")}
                                            </Badge>
                                        )}
                                    </span>
                                </TableCell>
                                <TableCell className="truncate">
                                    {(translationFormatter(t)(client.name) as string) || "-"}
                                </TableCell>
                                <TableCell className="truncate">
                                    {getProtocolName(
                                        t,
                                        client.protocol ?? "openid-connect"
                                    )}
                                </TableCell>
                                <TableCell className="truncate">
                                    {client.description || "-"}
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
                                                    navigate({
                                                        to: toClient({
                                                            realm,
                                                            clientId: client.id ?? "",
                                                            tab: "settings"
                                                        }) as string
                                                    })
                                                }
                                            >
                                                <PencilSimple className="size-4" />
                                                {t("edit")}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => exportClient(client)}
                                            >
                                                <DownloadSimple className="size-4" />
                                                {t("export")}
                                            </DropdownMenuItem>
                                            {!isRealmClient(client) &&
                                                (isManager ||
                                                    client.access?.configure) && (
                                                    <>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            className="text-destructive focus:text-destructive"
                                                            onClick={() =>
                                                                setSelectedClient(client)
                                                            }
                                                        >
                                                            <Trash className="size-4" />
                                                            {t("delete")}
                                                        </DropdownMenuItem>
                                                    </>
                                                )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
                <TableFooter>
                    <TableRow>
                        <TableCell colSpan={5} className="p-0">
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
    );

    const renderMainContent = () => {
        if (isClientRegistration) {
            return (
                <Tabs
                    value={clientRegistrationTab}
                    onValueChange={value =>
                        navigate({
                            to: toClientRegistration({
                                realm,
                                subTab: value as ClientRegistrationTab
                            }) as string
                        })
                    }
                >
                    <div className="w-full min-w-0 overflow-x-auto overflow-y-hidden mb-4">
                        <TabsList
                            variant="line"
                            className="mb-0 w-max min-w-0 **:data-[slot=tabs-trigger]:flex-none"
                        >
                            <TabsTrigger
                                value="anonymous"
                                data-testid="client-registration-anonymous-tab"
                            >
                                {t("anonymousAccessPolicies")}
                            </TabsTrigger>
                            <TabsTrigger
                                value="authenticated"
                                data-testid="client-registration-authenticated-tab"
                            >
                                {t("authenticatedAccessPolicies")}
                            </TabsTrigger>
                        </TabsList>
                    </div>
                    <TabsContent value="anonymous" className="mt-0 pt-0 outline-none">
                        <ClientRegistration subTab="anonymous" />
                    </TabsContent>
                    <TabsContent value="authenticated" className="mt-0 pt-0 outline-none">
                        <ClientRegistration subTab="authenticated" />
                    </TabsContent>
                </Tabs>
            );
        }

        switch (currentTab) {
            case "initial-access-token":
                return <InitialAccessTokenList />;
            case "client-registration":
                return <ClientRegistration key="anonymous" subTab="anonymous" />;
            default:
                return renderClientList();
        }
    };

    return (
        <>
            <AlertDialog
                open={!!selectedClient}
                onOpenChange={open => !open && setSelectedClient(undefined)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {t("clientDelete", { clientId: selectedClient?.clientId })}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("clientDeleteConfirm")}
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
            <Tabs
                value={currentTab}
                onValueChange={value =>
                    navigate({
                        to: toClients({
                            realm,
                            tab: value === "list" ? undefined : (value as ClientsTab)
                        }) as string
                    })
                }
            >
                <div className="w-full min-w-0 overflow-x-auto overflow-y-hidden mb-4">
                    <TabsList
                        variant="line"
                        className="mb-0 w-max min-w-0 **:data-[slot=tabs-trigger]:flex-none"
                    >
                        <TabsTrigger value="list" data-testid="clients-list-tab">
                            {t("clientList")}
                        </TabsTrigger>
                        <TabsTrigger
                            value="initial-access-token"
                            data-testid="clients-initial-access-tab"
                        >
                            {t("initialAccessToken")}
                        </TabsTrigger>
                        <TabsTrigger
                            value="client-registration"
                            data-testid="clients-registration-tab"
                        >
                            {t("clientRegistration")}
                        </TabsTrigger>
                    </TabsList>
                </div>
                <TabsContent value={currentTab} className="mt-0 pt-0 outline-none">
                    {renderMainContent()}
                </TabsContent>
            </Tabs>
        </>
    );
}
