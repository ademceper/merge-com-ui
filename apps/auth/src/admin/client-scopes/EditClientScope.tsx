/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/client-scopes/EditClientScope.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import ClientScopeRepresentation from "@keycloak/keycloak-admin-client/lib/defs/clientScopeRepresentation";
import type ProtocolMapperRepresentation from "@keycloak/keycloak-admin-client/lib/defs/protocolMapperRepresentation";
import type { RoleMappingPayload } from "@keycloak/keycloak-admin-client/lib/defs/roleRepresentation";
import type { ProtocolMapperTypeRepresentation } from "@keycloak/keycloak-admin-client/lib/defs/serverInfoRepesentation";
import {
    KeycloakSpinner,
    useAlerts,
    useFetch,
    useHelp
} from "../../shared/keycloak-ui-shared";
import { Alert, AlertTitle } from "@merge/ui/components/alert";
import { DropdownMenuItem } from "@merge/ui/components/dropdown-menu";
import { AlertVariant } from "../../shared/keycloak-ui-shared";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams as useRouterParams } from "react-router-dom";
import { useAdminClient } from "../admin-client";
import {
    AllClientScopes,
    ClientScope,
    ClientScopeDefaultOptionalType,
    changeScope
} from "../components/client-scope/ClientScopeTypes";
import { useConfirmDialog } from "../components/confirm-dialog/ConfirmDialog";
import { RoleMapping, Row } from "../components/role-mapping/RoleMapping";
import { ViewHeader } from "../components/view-header/ViewHeader";
import { useRealm } from "../context/realm-context/RealmContext";
import { convertFormValuesToObject } from "../util";
import { useParams } from "../utils/useParams";
import { MapperList } from "./details/MapperList";
import { ScopeForm } from "./details/ScopeForm";
import { ClientScopeParams } from "./routes/ClientScope";
import { toClientScopes } from "./routes/ClientScopes";
import { toMapper } from "./routes/Mapper";
import { useAccess } from "../context/access/Access";
import { AdminEvents } from "../events/AdminEvents";

export default function EditClientScope() {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
    const navigate = useNavigate();
    const { realm, realmRepresentation } = useRealm();
    const { id } = useParams<ClientScopeParams>();
    const { tab } = useRouterParams<{ tab?: string }>();
    const { addAlert, addError } = useAlerts();
    const { enabled } = useHelp();
    const [clientScope, setClientScope] = useState<ClientScopeDefaultOptionalType>();
    const [key, setKey] = useState(0);
    const refresh = () => setKey(key + 1);
    const { hasAccess } = useAccess();

    useFetch(
        async () => {
            const clientScope = await adminClient.clientScopes.findOne({ id });

            if (!clientScope) {
                throw new Error(t("notFound"));
            }

            return {
                ...clientScope,
                type: await determineScopeType(clientScope)
            };
        },
        clientScope => {
            setClientScope(clientScope);
        },
        [key, id]
    );

    async function determineScopeType(clientScope: ClientScopeRepresentation) {
        const defaultScopes = await adminClient.clientScopes.listDefaultClientScopes();
        const hasDefaultScope = defaultScopes.find(
            defaultScope => defaultScope.name === clientScope.name
        );

        if (hasDefaultScope) {
            return ClientScope.default;
        }

        const optionalScopes =
            await adminClient.clientScopes.listDefaultOptionalClientScopes();
        const hasOptionalScope = optionalScopes.find(
            optionalScope => optionalScope.name === clientScope.name
        );

        return hasOptionalScope ? ClientScope.optional : AllClientScopes.none;
    }

    const onSubmit = async (formData: ClientScopeDefaultOptionalType) => {
        const clientScope = convertFormValuesToObject({
            ...formData,
            name: formData.name?.trim().replace(/ /g, "_")
        });

        try {
            await adminClient.clientScopes.update({ id }, clientScope);
            await changeScope(adminClient, { ...clientScope, id }, clientScope.type);

            addAlert(t("updateSuccessClientScope"), AlertVariant.success);
        } catch (error) {
            addError("updateErrorClientScope", error);
        }
    };

    const [toggleDeleteDialog, DeleteConfirm] = useConfirmDialog({
        titleKey: t("deleteClientScope", {
            count: 1,
            name: clientScope?.name
        }),
        messageKey: "deleteConfirmClientScopes",
        continueButtonLabel: "delete",
        continueButtonVariant: "destructive",
        onConfirm: async () => {
            try {
                await adminClient.clientScopes.del({ id });
                addAlert(t("deletedSuccessClientScope"), AlertVariant.success);
                navigate(toClientScopes({ realm }));
            } catch (error) {
                addError("deleteErrorClientScope", error);
            }
        }
    });

    const assignRoles = async (rows: Row[]) => {
        try {
            const realmRoles = rows
                .filter(row => row.client === undefined)
                .map(row => row.role as RoleMappingPayload)
                .flat();
            await adminClient.clientScopes.addRealmScopeMappings(
                {
                    id
                },
                realmRoles
            );
            await Promise.all(
                rows
                    .filter(row => row.client !== undefined)
                    .map(row =>
                        adminClient.clientScopes.addClientScopeMappings(
                            {
                                id,
                                client: row.client!.id!
                            },
                            [row.role as RoleMappingPayload]
                        )
                    )
            );
            addAlert(t("roleMappingUpdatedSuccess"), AlertVariant.success);
        } catch (error) {
            addError("roleMappingUpdatedError", error);
        }
    };

    const addMappers = async (
        mappers: ProtocolMapperTypeRepresentation | ProtocolMapperRepresentation[]
    ): Promise<void> => {
        if (!Array.isArray(mappers)) {
            const mapper = mappers as ProtocolMapperTypeRepresentation;
            navigate(
                toMapper({
                    realm,
                    id: clientScope!.id!,
                    mapperId: mapper.id!,
                    viewMode: "new"
                })
            );
        } else {
            try {
                await adminClient.clientScopes.addMultipleProtocolMappers(
                    { id: clientScope!.id! },
                    mappers as ProtocolMapperRepresentation[]
                );
                refresh();
                addAlert(t("mappingCreatedSuccess"), AlertVariant.success);
            } catch (error) {
                addError("mappingCreatedError", error);
            }
        }
    };

    const onDelete = async (mapper: ProtocolMapperRepresentation) => {
        try {
            await adminClient.clientScopes.delProtocolMapper({
                id: clientScope!.id!,
                mapperId: mapper.id!
            });
            addAlert(t("mappingDeletedSuccess"), AlertVariant.success);
            refresh();
        } catch (error) {
            addError("mappingDeletedError", error);
        }
        return true;
    };

    if (!clientScope) {
        return <KeycloakSpinner />;
    }

    const renderContent = () => {
        switch (tab) {
            case "mappers":
                return (
                    <MapperList
                        model={clientScope}
                        onAdd={addMappers}
                        onDelete={onDelete}
                        detailLink={mapperId =>
                            toMapper({
                                realm,
                                id: clientScope.id!,
                                mapperId: mapperId!,
                                viewMode: "edit"
                            })
                        }
                    />
                );
            case "scope":
                return (
                    <>
                        {enabled && (
                            <div className="p-6">
                                <Alert>
                                    <AlertTitle>{t("clientScopesRolesScope")}</AlertTitle>
                                </Alert>
                            </div>
                        )}
                        <RoleMapping
                            id={clientScope.id!}
                            name={clientScope.name!}
                            type="clientScopes"
                            save={assignRoles}
                        />
                    </>
                );
            case "events":
                return (realmRepresentation?.adminEventsEnabled && hasAccess("view-events")) ? (
                    <AdminEvents resourcePath={`*client-scopes/${id}`} />
                ) : null;
            default:
                return (
                    <div className="p-6">
                        <ScopeForm save={onSubmit} clientScope={clientScope} />
                    </div>
                );
        }
    };

    return (
        <>
            <DeleteConfirm />
            <ViewHeader
                titleKey={clientScope.name!}
                dropdownItems={[
                    <DropdownMenuItem key="delete" onClick={toggleDeleteDialog}>
                        {t("delete")}
                    </DropdownMenuItem>
                ]}
                badges={[{ text: clientScope.protocol }]}
                divider={false}
            />

            <div className="p-0">
                <div className="bg-muted/30">
                    {renderContent()}
                </div>
            </div>
        </>
    );
}
