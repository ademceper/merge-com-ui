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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@merge-rd/ui/components/tabs";
import { DownloadSimple, PencilSimple, Plus, Trash } from "@phosphor-icons/react";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
    type ColumnDef,
    DataTable,
    DataTableRowActions
} from "@/admin/shared/ui/data-table";
import { getErrorDescription, getErrorMessage } from "../../../shared/keycloak-ui-shared";
import { useAdminClient } from "../../app/admin-client";
import { useAccess } from "../../app/providers/access/access";
import { useRealm } from "../../app/providers/realm-context/realm-context";
import { translationFormatter } from "../../shared/lib/translationFormatter";
import { exportClient } from "../../shared/lib/util";
import { AddClientDialog } from "./add/add-client-dialog";
import { useClients } from "./api/use-clients";
import { InitialAccessTokenList } from "./initial-access/initial-access-token-list";
import { ClientRegistration } from "./registration/client-registration";
import { toClient } from "../../shared/lib/routes/clients";
import type { ClientRegistrationTab } from "../../shared/lib/routes/clients";
import { toClientRegistration } from "../../shared/lib/routes/clients";
import type { ClientsTab } from "../../shared/lib/routes/clients";
import { toClients } from "../../shared/lib/routes/clients";
import { getProtocolName, isRealmClient } from "./utils";

export default function ClientsSection() {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
    const { realm } = useRealm();
    const navigate = useNavigate();
    const { tab, subTab } = useParams({ strict: false }) as {
        tab?: string;
        subTab?: string;
    };

    const { data: clients = [], refetch } = useClients();
    const [selectedClient, setSelectedClient] = useState<ClientRepresentation>();

    const { hasAccess } = useAccess();
    const isManager = hasAccess("manage-clients");

    const onDeleteConfirm = async () => {
        if (!selectedClient?.id) return;
        try {
            await adminClient.clients.del({ id: selectedClient.id });
            setSelectedClient(undefined);
            toast.success(t("clientDeletedSuccess"));
            refetch();
        } catch (error) {
            toast.error(t("clientDeleteError", { error: getErrorMessage(error) }), {
                description: getErrorDescription(error)
            });
        }
    };

    const columns: ColumnDef<ClientRepresentation>[] = [
        {
            accessorKey: "clientId",
            header: t("clientId"),
            cell: ({ row }) => (
                <span className="flex items-center gap-2">
                    <Link
                        to={
                            toClient({
                                realm,
                                clientId: row.original.id!,
                                tab: "settings"
                            }) as string
                        }
                        className="text-primary hover:underline"
                    >
                        {row.original.clientId}
                    </Link>
                    {!row.original.enabled && (
                        <Badge variant="secondary">{t("disabled")}</Badge>
                    )}
                </span>
            )
        },
        {
            accessorKey: "name",
            header: t("clientName"),
            cell: ({ row }) =>
                (translationFormatter(t)(row.original.name) as string) || "-"
        },
        {
            accessorKey: "protocol",
            header: t("type"),
            cell: ({ row }) =>
                getProtocolName(t, row.original.protocol ?? "openid-connect")
        },
        {
            accessorKey: "description",
            header: t("description"),
            cell: ({ row }) => row.original.description || "-"
        },
        {
            id: "actions",
            header: "",
            size: 50,
            enableHiding: false,
            cell: ({ row }) => {
                const client = row.original;
                const canDelete =
                    !isRealmClient(client) && (isManager || client.access?.configure);
                return (
                    <DataTableRowActions row={row}>
                        <button
                            type="button"
                            className="flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                            onClick={() =>
                                navigate({
                                    to: toClient({
                                        realm,
                                        clientId: client.id!,
                                        tab: "settings"
                                    }) as string
                                })
                            }
                        >
                            <PencilSimple className="size-4 shrink-0" />
                            {t("edit")}
                        </button>
                        <button
                            type="button"
                            className="flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                            onClick={() => exportClient(client)}
                        >
                            <DownloadSimple className="size-4 shrink-0" />
                            {t("export")}
                        </button>
                        {canDelete && (
                            <>
                                <div className="my-1 h-px bg-border" />
                                <button
                                    type="button"
                                    className="flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left text-sm text-destructive hover:bg-destructive/10 hover:text-destructive"
                                    onClick={() => setSelectedClient(client)}
                                >
                                    <Trash className="size-4 shrink-0" />
                                    {t("delete")}
                                </button>
                            </>
                        )}
                    </DataTableRowActions>
                );
            }
        }
    ];

    const isClientRegistration = Boolean(subTab);
    const clientRegistrationTab: ClientRegistrationTab =
        subTab === "authenticated" ? "authenticated" : "anonymous";

    const currentTab: ClientsTab =
        tab === "initial-access-token" || tab === "client-registration" ? tab : "list";

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
                return (
                    <DataTable
                        columns={columns}
                        data={clients}
                        searchColumnId="clientId"
                        searchPlaceholder={t("searchForClient")}
                        emptyMessage={t("noClients")}
                        onRowClick={row =>
                            navigate({
                                to: toClient({
                                    realm,
                                    clientId: row.original.id!,
                                    tab: "settings"
                                }) as string
                            })
                        }
                        toolbar={
                            <AddClientDialog
                                trigger={
                                    <Button
                                        type="button"
                                        data-testid="createClient"
                                        variant="default"
                                        className="flex h-9 w-9 shrink-0 items-center justify-center p-0 sm:h-9 sm:w-auto sm:gap-2 sm:px-4 sm:py-2"
                                        aria-label={t("createClient")}
                                    >
                                        <Plus size={20} className="shrink-0 sm:hidden" />
                                        <span className="hidden sm:inline">
                                            {t("createClient")}
                                        </span>
                                    </Button>
                                }
                            />
                        }
                    />
                );
        }
    };

    return (
        <div className="pt-4 pb-6 px-0 min-w-0">
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
        </div>
    );
}
