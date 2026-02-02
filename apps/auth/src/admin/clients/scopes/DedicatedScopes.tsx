/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/clients/scopes/DedicatedScopes.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import type ClientRepresentation from "@keycloak/keycloak-admin-client/lib/defs/clientRepresentation";
import type ProtocolMapperRepresentation from "@keycloak/keycloak-admin-client/lib/defs/protocolMapperRepresentation";
import type { ProtocolMapperTypeRepresentation } from "@keycloak/keycloak-admin-client/lib/defs/serverInfoRepesentation";
import { useAlerts, useFetch } from "../../../shared/keycloak-ui-shared";
import { AlertVariant } from "../../../shared/keycloak-ui-shared";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAdminClient } from "../../admin-client";
import { MapperList } from "../../client-scopes/details/MapperList";
import { KeycloakSpinner } from "../../../shared/keycloak-ui-shared";
import {
    RoutableTabs,
    useRoutableTab,
    Tab
} from "../../components/routable-tabs/RoutableTabs";
import { ViewHeader } from "../../components/view-header/ViewHeader";
import { useParams } from "../../utils/useParams";
import {
    DedicatedScopeDetailsParams,
    DedicatedScopeTab,
    toDedicatedScope
} from "../routes/DedicatedScopeDetails";
import { toMapper } from "../routes/Mapper";
import { DedicatedScope } from "./DedicatedScope";

export default function DedicatedScopes() {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
    const navigate = useNavigate();
    const { realm, clientId } = useParams<DedicatedScopeDetailsParams>();
    const { addAlert, addError } = useAlerts();

    const [client, setClient] = useState<ClientRepresentation>();

    useFetch(() => adminClient.clients.findOne({ id: clientId }), setClient, []);

    const useTab = (tab: DedicatedScopeTab) =>
        useRoutableTab(toDedicatedScope({ realm, clientId, tab }));

    const mappersTab = useTab("mappers");
    const scopeTab = useTab("scope");

    if (!client) {
        return <KeycloakSpinner />;
    }

    const addMappers = async (
        mappers: ProtocolMapperTypeRepresentation | ProtocolMapperRepresentation[]
    ): Promise<void> => {
        if (!Array.isArray(mappers)) {
            const mapper = mappers as ProtocolMapperTypeRepresentation;
            navigate(
                toMapper({
                    realm,
                    id: client.id!,
                    mapperId: mapper.id!,
                    viewMode: "new"
                })
            );
        } else {
            try {
                await adminClient.clients.addMultipleProtocolMappers(
                    { id: client.id! },
                    mappers as ProtocolMapperRepresentation[]
                );
                setClient(await adminClient.clients.findOne({ id: client.id! }));
                addAlert(t("mappingCreatedSuccess"), AlertVariant.success);
            } catch (error) {
                addError("mappingCreatedError", error);
            }
        }
    };

    const onDeleteMapper = async (mapper: ProtocolMapperRepresentation) => {
        try {
            await adminClient.clients.delProtocolMapper({
                id: client.id!,
                mapperId: mapper.id!
            });
            setClient({
                ...client,
                protocolMappers: client.protocolMappers?.filter(m => m.id !== mapper.id)
            });
            addAlert(t("mappingDeletedSuccess"), AlertVariant.success);
        } catch (error) {
            addError("mappingDeletedError", error);
        }
        return true;
    };

    return (
        <>
            <ViewHeader
                titleKey={client.clientId! + "-dedicated"}
                subKey="dedicatedScopeExplain"
                divider={false}
            />
            <div className="p-0">
                <RoutableTabs
                    isBox
                    mountOnEnter
                    defaultLocation={toDedicatedScope({
                        realm,
                        clientId,
                        tab: "mappers"
                    })}
                >
                    <Tab
                        title={t("mappers")}
                        data-testid="mappersTab"
                        {...mappersTab}
                    >
                        <MapperList
                            model={client}
                            onAdd={addMappers}
                            onDelete={onDeleteMapper}
                            detailLink={mapperId =>
                                toMapper({
                                    realm,
                                    id: client.id!,
                                    mapperId,
                                    viewMode: "edit"
                                })
                            }
                        />
                    </Tab>
                    <Tab
                        title={t("scope")}
                        data-testid="scopeTab"
                        {...scopeTab}
                    >
                        <DedicatedScope client={client} />
                    </Tab>
                </RoutableTabs>
            </div>
        </>
    );
}
