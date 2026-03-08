import type ProtocolMapperRepresentation from "@keycloak/keycloak-admin-client/lib/defs/protocolMapperRepresentation";
import type { ProtocolMapperTypeRepresentation } from "@keycloak/keycloak-admin-client/lib/defs/serverInfoRepesentation";
import { useTranslation } from "@merge-rd/i18n";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams as useRouterParams } from "@tanstack/react-router";
import { toast } from "sonner";
import {
    getErrorDescription,
    getErrorMessage,
    KeycloakSpinner
} from "../../../../shared/keycloak-ui-shared";
import { useAdminClient } from "../../../app/admin-client";
import { useParams } from "../../../shared/lib/useParams";
import { MapperList } from "../../client-scopes/details/mapper-list";
import { clientKeys } from "../api/keys";
import { useDedicatedScopeClient } from "../api/use-dedicated-scope-client";
import type { DedicatedScopeDetailsParams } from "../../../shared/lib/routes/clients";
import { toMapper } from "../../../shared/lib/routes/clients";
import { DedicatedScope } from "./dedicated-scope";

export default function DedicatedScopes() {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
    const navigate = useNavigate();
    const { realm, clientId } = useParams<DedicatedScopeDetailsParams>();
    const { tab } = useRouterParams({ strict: false }) as { tab?: string };
    const queryClient = useQueryClient();
    const { data: client } = useDedicatedScopeClient(clientId);

    if (!client) {
        return <KeycloakSpinner />;
    }

    const addMappers = async (
        mappers: ProtocolMapperTypeRepresentation | ProtocolMapperRepresentation[]
    ): Promise<void> => {
        if (!Array.isArray(mappers)) {
            const mapper = mappers as ProtocolMapperTypeRepresentation;
            navigate({
                to: toMapper({
                    realm,
                    id: client.id!,
                    mapperId: mapper.id!,
                    viewMode: "new"
                }) as string
            });
        } else {
            try {
                await adminClient.clients.addMultipleProtocolMappers(
                    { id: client.id! },
                    mappers as ProtocolMapperRepresentation[]
                );
                await queryClient.invalidateQueries({ queryKey: clientKeys.detail(client.id!) });
                toast.success(t("mappingCreatedSuccess"));
            } catch (error) {
                toast.error(t("mappingCreatedError", { error: getErrorMessage(error) }), {
                    description: getErrorDescription(error)
                });
            }
        }
    };

    const onDeleteMapper = async (mapper: ProtocolMapperRepresentation) => {
        try {
            await adminClient.clients.delProtocolMapper({
                id: client.id!,
                mapperId: mapper.id!
            });
            await queryClient.invalidateQueries({ queryKey: clientKeys.detail(client.id!) });
            toast.success(t("mappingDeletedSuccess"));
        } catch (error) {
            toast.error(t("mappingDeletedError", { error: getErrorMessage(error) }), {
                description: getErrorDescription(error)
            });
        }
        return true;
    };

    const renderContent = () => {
        switch (tab) {
            case "scope":
                return <DedicatedScope client={client} />;
            default:
                return (
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
                );
        }
    };

    return (
        <div className="p-0">
            <div className="bg-muted/30">{renderContent()}</div>
        </div>
    );
}
