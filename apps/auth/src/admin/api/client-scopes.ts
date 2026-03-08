import type ClientScopeRepresentation from "@keycloak/keycloak-admin-client/lib/defs/clientScopeRepresentation";
import type ProtocolMapperRepresentation from "@keycloak/keycloak-admin-client/lib/defs/protocolMapperRepresentation";
import type { RoleMappingPayload } from "@keycloak/keycloak-admin-client/lib/defs/roleRepresentation";
import { adminClient } from "../app/admin-client";
import type { Row } from "../pages/clients/scopes/client-scopes";
import {
    AllClientScopes,
    ClientScope
} from "../shared/ui/client-scope/client-scope-types";

export async function findClientScopes() {
    const [defaultScopes, optionalScopes, scopes] = await Promise.all([
        adminClient.clientScopes.listDefaultClientScopes(),
        adminClient.clientScopes.listDefaultOptionalClientScopes(),
        adminClient.clientScopes.find()
    ]);
    const transformed: Row[] = scopes.map(scope => ({
        ...scope,
        type: defaultScopes.find(s => s.name === scope.name)
            ? ClientScope.default
            : optionalScopes.find(s => s.name === scope.name)
              ? ClientScope.optional
              : AllClientScopes.none
    }));
    return transformed;
}

export async function findClientScope(id: string) {
    const clientScope = await adminClient.clientScopes.findOne({ id });
    if (!clientScope) {
        throw new Error("Client scope not found");
    }
    const type = await determineScopeType(clientScope);
    return { ...clientScope, type };
}

async function determineScopeType(
    clientScope: ClientScopeRepresentation
) {
    const defaultScopes = await adminClient.clientScopes.listDefaultClientScopes();
    if (defaultScopes.find(s => s.name === clientScope.name)) return ClientScope.default;
    const optionalScopes =
        await adminClient.clientScopes.listDefaultOptionalClientScopes();
    return optionalScopes.find(s => s.name === clientScope.name)
        ? ClientScope.optional
        : AllClientScopes.none;
}


export async function createClientScope(
    clientScope: ClientScopeRepresentation
) {
    return adminClient.clientScopes.create(clientScope);
}

export async function findClientScopeByName(
    name: string
) {
    return adminClient.clientScopes.findOneByName({ name });
}

export async function updateClientScope(
    id: string,
    clientScope: ClientScopeRepresentation
) {
    return adminClient.clientScopes.update({ id }, clientScope);
}

export async function deleteClientScope(id: string) {
    return adminClient.clientScopes.del({ id });
}

export async function addProtocolMappers(
    id: string,
    mappers: ProtocolMapperRepresentation[]
) {
    return adminClient.clientScopes.addMultipleProtocolMappers({ id }, mappers);
}

export async function deleteProtocolMapper(
    id: string,
    mapperId: string
) {
    return adminClient.clientScopes.delProtocolMapper({ id, mapperId });
}

export async function addRealmScopeMappings(
    id: string,
    roles: RoleMappingPayload[]
) {
    return adminClient.clientScopes.addRealmScopeMappings({ id }, roles);
}

export async function addClientScopeMappings(
    id: string,
    client: string,
    roles: RoleMappingPayload[]
) {
    return adminClient.clientScopes.addClientScopeMappings({ id, client }, roles);
}

export async function findProtocolMapper(
    id: string,
    mapperId: string
) {
    return adminClient.clientScopes.findProtocolMapper({ id, mapperId });
}

export async function findClientProtocolMapper(
    id: string,
    mapperId: string
) {
    return adminClient.clients.findProtocolMapperById({ id, mapperId });
}

export async function updateProtocolMapper(
    id: string,
    mapperId: string,
    mapping: ProtocolMapperRepresentation
) {
    return adminClient.clientScopes.updateProtocolMapper(
        { id, mapperId },
        { id: mapperId, ...mapping }
    );
}

export async function updateClientProtocolMapper(
    id: string,
    mapperId: string,
    mapping: ProtocolMapperRepresentation
) {
    return adminClient.clients.updateProtocolMapper(
        { id, mapperId },
        { id: mapperId, ...mapping }
    );
}

export async function addProtocolMapper(
    id: string,
    mapping: ProtocolMapperRepresentation
) {
    return adminClient.clientScopes.addProtocolMapper({ id }, mapping);
}

export async function addClientProtocolMapper(
    id: string,
    mapping: ProtocolMapperRepresentation
) {
    return adminClient.clients.addProtocolMapper({ id }, mapping);
}

export async function deleteProtocolMapperFromScope(
    id: string,
    mapperId: string
) {
    return adminClient.clientScopes.delProtocolMapper({ id, mapperId });
}

export async function deleteProtocolMapperFromClient(
    id: string,
    mapperId: string
) {
    return adminClient.clients.delProtocolMapper({ id, mapperId });
}

export async function fetchRealmKeys(realm: string) {
    const keysMetadata = await adminClient.realms.getKeys({ realm });
    return keysMetadata.keys || [];
}
