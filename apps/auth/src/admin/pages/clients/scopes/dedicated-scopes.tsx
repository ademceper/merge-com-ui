import type ProtocolMapperRepresentation from "@keycloak/keycloak-admin-client/lib/defs/protocolMapperRepresentation";
import type { ProtocolMapperTypeRepresentation } from "@keycloak/keycloak-admin-client/lib/defs/serverInfoRepesentation";
import { useTranslation } from "@merge-rd/i18n";
import { useNavigate, useParams as useRouterParams } from "@tanstack/react-router";
import { toast } from "sonner";
import {
    getErrorDescription,
    getErrorMessage,
    KeycloakSpinner
} from "../../../../shared/keycloak-ui-shared";
import { useAddMultipleProtocolMappers, useDelProtocolMapper } from "../hooks/use-protocol-mappers";
import type { DedicatedScopeDetailsParams } from "../../../shared/lib/routes/clients";
import { toMapper } from "../../../shared/lib/routes/clients";
import { useParams } from "../../../shared/lib/use-params";
import { MapperList } from "../../client-scopes/details/mapper-list";
import { useDedicatedScopeClient } from "../hooks/use-dedicated-scope-client";
import { DedicatedScope } from "./dedicated-scope";

export function DedicatedScopes() {

    const { t } = useTranslation();
    const navigate = useNavigate();
    const { realm, clientId } = useParams<DedicatedScopeDetailsParams>();
    const { tab } = useRouterParams({ strict: false }) as { tab?: string };
    const { mutateAsync: addMultipleProtocolMappers } = useAddMultipleProtocolMappers();
    const { mutateAsync: delProtocolMapper } = useDelProtocolMapper();
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
                await addMultipleProtocolMappers({
                    clientId: client.id!,
                    mappers: mappers as Record<string, unknown>[]
                });
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
            await delProtocolMapper({
                clientId: client.id!,
                mapperId: mapper.id!
            });
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
