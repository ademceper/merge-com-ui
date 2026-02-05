import type ClientRepresentation from "@keycloak/keycloak-admin-client/lib/defs/clientRepresentation";
import { getErrorDescription, getErrorMessage, useFetch } from "../../shared/keycloak-ui-shared";
import { toast } from "@merge/ui/components/sonner";
import { Badge } from "@merge/ui/components/badge";
import { Button } from "@merge/ui/components/button";
import {
    DataTable,
    DataTableRowActions,
    type ColumnDef
} from "@merge/ui/components/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@merge/ui/components/tabs";
import { DownloadSimple, PencilSimple, Plus, Trash } from "@phosphor-icons/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAdminClient } from "../admin-client";
import { AddClientDialog } from "./add/AddClientDialog";
import { useConfirmDialog } from "../components/confirm-dialog/ConfirmDialog";
import { ViewHeader } from "../components/view-header/ViewHeader";
import helpUrls from "../help-urls";
import { useAccess } from "../context/access/Access";
import { useRealm } from "../context/realm-context/RealmContext";
import { exportClient } from "../util";
import { translationFormatter } from "../utils/translationFormatter";
import { InitialAccessTokenList } from "./initial-access/InitialAccessTokenList";
import { ClientRegistration } from "./registration/ClientRegistration";
import { toClient } from "./routes/Client";
import {
    toClientRegistration
} from "./routes/client-registration-path";
import type { ClientRegistrationTab } from "./routes/client-registration-path";
import { getProtocolName, isRealmClient } from "./utils";

export default function ClientsSection() {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
    const { realm } = useRealm();
    const navigate = useNavigate();
    const { tab, subTab } = useParams<{ tab?: string; subTab?: string }>();

    const [key, setKey] = useState(0);
    const refresh = () => setKey(key + 1);
    const [clients, setClients] = useState<ClientRepresentation[]>([]);
    const [selectedClient, setSelectedClient] = useState<ClientRepresentation>();

    const { hasAccess } = useAccess();
    const isManager = hasAccess("manage-clients");

    useFetch(
        () => adminClient.clients.find({}),
        (data) => setClients(data),
        [key]
    );

    const [toggleDeleteDialog, DeleteConfirm] = useConfirmDialog({
        titleKey: t("clientDelete", { clientId: selectedClient?.clientId }),
        messageKey: "clientDeleteConfirm",
        continueButtonLabel: "delete",
        continueButtonVariant: "destructive",
        onConfirm: async () => {
            try {
                await adminClient.clients.del({
                    id: selectedClient!.id!
                });
                toast.success(t("clientDeletedSuccess"));
                refresh();
            } catch (error) {
                toast.error(t("clientDeleteError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
            }
        }
    });

    const columns: ColumnDef<ClientRepresentation>[] = [
        {
            accessorKey: "clientId",
            header: t("clientId"),
            cell: ({ row }) => (
                <span className="flex items-center gap-2">
                    <Link
                        to={toClient({ realm, clientId: row.original.id!, tab: "settings" })}
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
            cell: ({ row }) => translationFormatter(t)(row.original.name) as string || "-"
        },
        {
            accessorKey: "protocol",
            header: t("type"),
            cell: ({ row }) => getProtocolName(t, row.original.protocol ?? "openid-connect")
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
                const canDelete = !isRealmClient(client) && (isManager || client.access?.configure);
                return (
                    <DataTableRowActions row={row}>
                        <button
                            type="button"
                            className="flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                            onClick={() =>
                                navigate(toClient({ realm, clientId: client.id!, tab: "settings" }))
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
                                    onClick={() => {
                                        setSelectedClient(client);
                                        toggleDeleteDialog();
                                    }}
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

    return (
        <>
            {isClientRegistration ? (
                <ViewHeader
                    titleKey="clientRegistration"
                    subKey="clientRegistrationExplain"
                    helpUrl={helpUrls.clientsUrl}
                    divider
                />
            ) : tab === "initial-access-token" ? (
                <ViewHeader
                    titleKey="initialAccessToken"
                    subKey="initialAccessTokenExplain"
                    helpUrl={helpUrls.clientsUrl}
                    divider
                />
            ) : (
                <ViewHeader
                    titleKey="clientList"
                    subKey="clientsExplain"
                    helpUrl={helpUrls.clientsUrl}
                    divider
                />
            )}
            <div className="py-6 px-0 min-w-0">
                <DeleteConfirm />
                {isClientRegistration ? (
                    <Tabs
                        value={clientRegistrationTab}
                        onValueChange={(value) =>
                            navigate(toClientRegistration({ realm, subTab: value as ClientRegistrationTab }))
                        }
                    >
                        <div className="w-full min-w-0 overflow-x-auto overflow-y-hidden mb-4">
                            <TabsList variant="line" className="mb-0 w-max min-w-0 **:data-[slot=tabs-trigger]:flex-none">
                                <TabsTrigger value="anonymous" data-testid="client-registration-anonymous-tab">
                                    {t("anonymousAccessPolicies")}
                                </TabsTrigger>
                                <TabsTrigger value="authenticated" data-testid="client-registration-authenticated-tab">
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
                ) : tab === "initial-access-token" ? (
                    <InitialAccessTokenList />
                ) : tab === "client-registration" ? (
                    <ClientRegistration key="anonymous" subTab="anonymous" />
                ) : (
                    <DataTable
                        key={key}
                        columns={columns}
                        data={clients}
                        searchColumnId="clientId"
                        searchPlaceholder={t("searchForClient")}
                        emptyMessage={t("noClients")}
                        onRowClick={(row) =>
                            navigate(toClient({ realm, clientId: row.original.id!, tab: "settings" }))
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
                                        <span className="hidden sm:inline">{t("createClient")}</span>
                                    </Button>
                                }
                            />
                        }
                    />
                )}
            </div>
        </>
    );
}
