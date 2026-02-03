/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/clients/ClientsSection.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import type ClientRepresentation from "@keycloak/keycloak-admin-client/lib/defs/clientRepresentation";
import { useFetch, useAlerts } from "../../shared/keycloak-ui-shared";
import { AlertVariant } from "../../shared/keycloak-ui-shared";
import { Badge } from "@merge/ui/components/badge";
import { Button } from "@merge/ui/components/button";
import {
    DataTable,
    DataTableRowActions,
    type ColumnDef
} from "@merge/ui/components/table";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAdminClient } from "../admin-client";
import { useConfirmDialog } from "../components/confirm-dialog/ConfirmDialog";
import { ViewHeader } from "../components/view-header/ViewHeader";
import { useAccess } from "../context/access/Access";
import { useRealm } from "../context/realm-context/RealmContext";
import helpUrls from "../help-urls";
import { exportClient } from "../util";
import { translationFormatter } from "../utils/translationFormatter";
import { InitialAccessTokenList } from "./initial-access/InitialAccessTokenList";
import { ClientRegistration } from "./registration/ClientRegistration";
import { toAddClient } from "./routes/AddClient";
import { toClient } from "./routes/Client";
import { getProtocolName, isRealmClient } from "./utils";

export default function ClientsSection() {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
    const { addAlert, addError } = useAlerts();
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
                addAlert(t("clientDeletedSuccess"), AlertVariant.success);
                refresh();
            } catch (error) {
                addError("clientDeleteError", error);
            }
        }
    });

    const columns: ColumnDef<ClientRepresentation>[] = [
        {
            accessorKey: "clientId",
            header: t("clientId"),
            cell: ({ row }) => (
                <Link
                    className="text-primary hover:underline"
                    to={toClient({ realm, clientId: row.original.id!, tab: "settings" })}
                >
                    {row.original.clientId}
                    {!row.original.enabled && (
                        <Badge variant="secondary" className="ml-2">
                            {t("disabled")}
                        </Badge>
                    )}
                </Link>
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
                            className="w-full rounded-md px-1.5 py-1 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                            onClick={() =>
                                navigate(toClient({ realm, clientId: client.id!, tab: "settings" }))
                            }
                        >
                            {t("edit")}
                        </button>
                        <button
                            type="button"
                            className="w-full rounded-md px-1.5 py-1 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                            onClick={() => exportClient(client)}
                        >
                            {t("export")}
                        </button>
                        {canDelete && (
                            <>
                                <div className="my-1 h-px bg-border" />
                                <button
                                    type="button"
                                    className="w-full rounded-md px-1.5 py-1 text-left text-sm text-destructive hover:bg-destructive/10 hover:text-destructive"
                                    onClick={() => {
                                        setSelectedClient(client);
                                        toggleDeleteDialog();
                                    }}
                                >
                                    {t("delete")}
                                </button>
                            </>
                        )}
                    </DataTableRowActions>
                );
            }
        }
    ];

    const renderContent = () => {
        // subTab varsa client-registration route'undan geliyoruz
        if (subTab) {
            return <ClientRegistration key={subTab} subTab={subTab} />;
        }

        switch (tab) {
            case "initial-access-token":
                return <InitialAccessTokenList />;
            case "client-registration":
                return <ClientRegistration key="anonymous" subTab="anonymous" />;
            default:
                return (
                    <div className="p-6">
                        <DeleteConfirm />
                        <DataTable
                            key={key}
                            columns={columns}
                            data={clients}
                            searchColumnId="clientId"
                            searchPlaceholder={t("searchForClient")}
                            emptyMessage={t("noClients")}
                            toolbar={
                                isManager ? (
                                    <Button data-testid="createClient" asChild>
                                        <Link to={toAddClient({ realm })}>{t("createClient")}</Link>
                                    </Button>
                                ) : undefined
                            }
                        />
                    </div>
                );
        }
    };

    return (
        <>
            <ViewHeader
                titleKey="clientList"
                subKey="clientsExplain"
                helpUrl={helpUrls.clientsUrl}
                divider={false}
            />
            <div>
                {renderContent()}
            </div>
        </>
    );
}
