import ClientScopeRepresentation from "@keycloak/keycloak-admin-client/lib/defs/clientScopeRepresentation";
import type ProtocolMapperRepresentation from "@keycloak/keycloak-admin-client/lib/defs/protocolMapperRepresentation";
import type { RoleMappingPayload } from "@keycloak/keycloak-admin-client/lib/defs/roleRepresentation";
import type { ProtocolMapperTypeRepresentation } from "@keycloak/keycloak-admin-client/lib/defs/serverInfoRepesentation";
import { getErrorDescription, getErrorMessage, KeycloakSpinner,
    useFetch,
    useHelp } from "../../shared/keycloak-ui-shared";
import { toast } from "sonner";
import { Alert, AlertTitle } from "@merge-rd/ui/components/alert";
import { Badge } from "@merge-rd/ui/components/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@merge-rd/ui/components/dropdown-menu";
import { buttonVariants } from "@merge-rd/ui/components/button";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams as useRouterParams } from "react-router-dom";
import { useAdminClient } from "../admin-client";
import {
    AllClientScopes,
    ClientScope,
    ClientScopeDefaultOptionalType,
    changeScope
} from "../components/client-scope/client-scope-types";
import { useConfirmDialog } from "../components/confirm-dialog/confirm-dialog";
import { RoleMapping, Row } from "../components/role-mapping/role-mapping";
import { useRealm } from "../context/realm-context/realm-context";
import { convertFormValuesToObject } from "../util";
import { useParams } from "../utils/useParams";
import { MapperList } from "./details/mapper-list";
import { ScopeForm } from "./details/scope-form";
import { ClientScopeParams } from "./routes/client-scope";
import { toClientScopes } from "./routes/client-scopes";
import { toMapper } from "./routes/mapper";
import { useAccess } from "../context/access/access";
import { AdminEvents } from "../events/admin-events";

export default function EditClientScope() {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
    const navigate = useNavigate();
    const { realm, realmRepresentation } = useRealm();
    const { id } = useParams<ClientScopeParams>();
    const { tab } = useRouterParams<{ tab?: string }>();
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

            toast.success(t("updateSuccessClientScope"));
        } catch (error) {
            toast.error(t("updateErrorClientScope", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
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
                toast.success(t("deletedSuccessClientScope"));
                navigate(toClientScopes({ realm }));
            } catch (error) {
                toast.error(t("deleteErrorClientScope", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
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
            toast.success(t("roleMappingUpdatedSuccess"));
        } catch (error) {
            toast.error(t("roleMappingUpdatedError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
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
                toast.success(t("mappingCreatedSuccess"));
            } catch (error) {
                toast.error(t("mappingCreatedError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
            }
        }
    };

    const onDelete = async (mapper: ProtocolMapperRepresentation) => {
        try {
            await adminClient.clientScopes.delProtocolMapper({
                id: clientScope!.id!,
                mapperId: mapper.id!
            });
            toast.success(t("mappingDeletedSuccess"));
            refresh();
        } catch (error) {
            toast.error(t("mappingDeletedError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
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
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                    <Badge>{clientScope.protocol}</Badge>
                </div>
                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger data-testid="action-dropdown" className={buttonVariants()}>
                            {t("action")}
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem key="delete" onClick={toggleDeleteDialog}>
                                {t("delete")}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <div className="p-0">
                <div className="bg-muted/30">
                    {renderContent()}
                </div>
            </div>
        </>
    );
}
