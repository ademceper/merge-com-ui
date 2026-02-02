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
import type { ClientQuery } from "@keycloak/keycloak-admin-client/lib/resources/clients";
import { useAlerts, useEnvironment } from "../../shared/keycloak-ui-shared";
import { AlertVariant } from "../../shared/keycloak-ui-shared";
import { Badge } from "@merge/ui/components/badge";
import { Button } from "@merge/ui/components/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@merge/ui/components/tooltip";
import { Warning } from "@phosphor-icons/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useAdminClient } from "../admin-client";
import { useConfirmDialog } from "../components/confirm-dialog/ConfirmDialog";
import { FormattedLink } from "../components/external-link/FormattedLink";
import { RoutableTabs, useRoutableTab } from "../components/routable-tabs/RoutableTabs";
import { Action, KeycloakDataTable } from "../../shared/keycloak-ui-shared";
import { ViewHeader } from "../components/view-header/ViewHeader";
import { useAccess } from "../context/access/Access";
import { useRealm } from "../context/realm-context/RealmContext";
import { Environment } from "../environment";
import helpUrls from "../help-urls";
import { emptyFormatter, exportClient } from "../util";
import { convertClientToUrl } from "../utils/client-url";
import { translationFormatter } from "../utils/translationFormatter";
import { InitialAccessTokenList } from "./initial-access/InitialAccessTokenList";
import { ClientRegistration } from "./registration/ClientRegistration";
import { toAddClient } from "./routes/AddClient";
import { toClient } from "./routes/Client";
import { ClientsTab, toClients } from "./routes/clients-path";
import { toImportClient } from "./routes/ImportClient";
import { getProtocolName, isRealmClient } from "./utils";

const ClientDetailLink = (client: ClientRepresentation) => {
    const { t } = useTranslation();
    const { realm } = useRealm();
    return (
        <span className="truncate block">
            <Link
                key={client.id}
                to={toClient({ realm, clientId: client.id!, tab: "settings" })}
            >
                {client.clientId}
                {!client.enabled && (
                    <Badge key={`${client.id}-disabled`} variant="secondary" className="ml-2">
                        {t("disabled")}
                    </Badge>
                )}
            </Link>
            {client.attributes?.["is_temporary_admin"] === "true" && (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span className="ml-2 inline-flex" id="temporary-admin-label">
                                <Warning className="size-4 text-amber-600" />
                            </span>
                        </TooltipTrigger>
                        <TooltipContent>{t("temporaryService")}</TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )}
        </span>
    );
};

const ClientName = (client: ClientRepresentation) => {
    const { t } = useTranslation();
    return (
        <span className="truncate block">
            {translationFormatter(t)(client.name) as string}
        </span>
    );
};

const ClientDescription = (client: ClientRepresentation) => (
    <span className="truncate block">
        {emptyFormatter()(client.description) as string}
    </span>
);

const ClientHomeLink = (client: ClientRepresentation) => {
    const { environment } = useEnvironment<Environment>();
    const href = convertClientToUrl(client, environment);

    if (!href) {
        return "—";
    }

    return (
        <FormattedLink href={href} data-testid={`client-home-url-${client.clientId}`} />
    );
};

const ToolbarItems = () => {
    const { t } = useTranslation();
    const { realm } = useRealm();

    const { hasAccess } = useAccess();
    const isManager = hasAccess("manage-clients");

    if (!isManager) return <span />;

    return (
        <>
            <Button asChild data-testid="createClient">
                <Link to={toAddClient({ realm })}>{t("createClient")}</Link>
            </Button>
            <Button asChild variant="link" data-testid="importClient">
                <Link to={toImportClient({ realm })}>{t("importClient")}</Link>
            </Button>
        </>
    );
};

export default function ClientsSection() {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
    const { addAlert, addError } = useAlerts();
    const { realm } = useRealm();

    const [key, setKey] = useState(0);
    const refresh = () => setKey(new Date().getTime());
    const [selectedClient, setSelectedClient] = useState<ClientRepresentation>();

    const { hasAccess } = useAccess();
    const isManager = hasAccess("manage-clients");

    const loader = async (first?: number, max?: number, search?: string) => {
        const params: ClientQuery = {
            first: first!,
            max: max!
        };
        if (search) {
            params.clientId = search;
            params.search = true;
        }
        return adminClient.clients.find({ ...params });
    };

    const useTab = (tab: ClientsTab) => useRoutableTab(toClients({ realm, tab }));

    const listTab = useTab("list");
    const initialAccessTokenTab = useTab("initial-access-token");
    const clientRegistrationTab = useTab("client-registration");

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

    return (
        <>
            <ViewHeader
                titleKey="clientList"
                subKey="clientsExplain"
                helpUrl={helpUrls.clientsUrl}
                divider={false}
            />
            <div className="bg-muted/30 p-0">
                <RoutableTabs
                    mountOnEnter
                    unmountOnExit
                    isBox
                    defaultLocation={toClients({
                        realm,
                        tab: "list"
                    })}
                >
                    <Tab
                        data-testid="list"
                        title={t("clientsList")}
                        {...listTab}
                    >
                        <DeleteConfirm />
                        <KeycloakDataTable
                            key={key}
                            loader={loader}
                            isPaginated
                            ariaLabelKey="clientList"
                            searchPlaceholderKey="searchForClient"
                            toolbarItem={<ToolbarItems />}
                            actionResolver={(rowData: { data: ClientRepresentation }) => {
                                const client = rowData.data;
                                const actions: Action<ClientRepresentation>[] = [
                                    {
                                        title: t("export"),
                                        onClick() {
                                            exportClient(client);
                                        }
                                    }
                                ];

                                if (
                                    !isRealmClient(client) &&
                                    (isManager || client.access?.configure)
                                ) {
                                    actions.push({
                                        title: t("delete"),
                                        onClick() {
                                            setSelectedClient(client);
                                            toggleDeleteDialog();
                                        }
                                    });
                                }

                                return actions;
                            }}
                            columns={[
                                {
                                    name: "clientId",
                                    displayKey: "clientId",
                                    cellRenderer: ClientDetailLink
                                },
                                {
                                    name: "clientName",
                                    displayKey: "clientName",
                                    cellRenderer: ClientName
                                },
                                {
                                    name: "protocol",
                                    displayKey: "type",
                                    cellRenderer: client =>
                                        getProtocolName(
                                            t,
                                            client.protocol ?? "openid-connect"
                                        )
                                },
                                {
                                    name: "description",
                                    displayKey: "description",
                                    cellRenderer: ClientDescription
                                },
                                {
                                    name: "baseUrl",
                                    displayKey: "homeURL",
                                    cellRenderer: ClientHomeLink
                                }
                            ]}
                        />
                    </Tab>
                    <Tab
                        data-testid="initialAccessToken"
                        title={t("initialAccessToken")}
                        {...initialAccessTokenTab}
                    >
                        <InitialAccessTokenList />
                    </Tab>
                    <Tab
                        data-testid="registration"
                        title={t("clientRegistration")}
                        {...clientRegistrationTab}
                    >
                        <ClientRegistration />
                    </Tab>
                </RoutableTabs>
            </div>
        </>
    );
}
