import type KeycloakAdminClient from "@keycloak/keycloak-admin-client";
import type ClientScopeRepresentation from "@keycloak/keycloak-admin-client/lib/defs/clientScopeRepresentation";
import type ProtocolMapperRepresentation from "@keycloak/keycloak-admin-client/lib/defs/protocolMapperRepresentation";
import type { RoleMappingPayload } from "@keycloak/keycloak-admin-client/lib/defs/roleRepresentation";
import {
    AllClientScopes,
    ClientScope
} from "../shared/ui/client-scope/client-scope-types";
import type { Row } from "../pages/clients/scopes/client-scopes";

export async function findClientScopes(adminClient: KeycloakAdminClient) {
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

export async function findClientScope(adminClient: KeycloakAdminClient, id: string) {
    const clientScope = await adminClient.clientScopes.findOne({ id });
    if (!clientScope) {
        throw new Error("Client scope not found");
    }
    const type = await determineScopeType(adminClient, clientScope);
    return { ...clientScope, type };
}

export async function determineScopeType(
    adminClient: KeycloakAdminClient,
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

export async function findDefaultClientScopes(adminClient: KeycloakAdminClient) {
    return adminClient.clientScopes.listDefaultClientScopes();
}

export async function findOptionalClientScopes(adminClient: KeycloakAdminClient) {
    return adminClient.clientScopes.listDefaultOptionalClientScopes();
}

export async function createClientScope(
    adminClient: KeycloakAdminClient,
    clientScope: ClientScopeRepresentation
) {
    return adminClient.clientScopes.create(clientScope);
}

export async function findClientScopeByName(
    adminClient: KeycloakAdminClient,
    name: string
) {
    return adminClient.clientScopes.findOneByName({ name });
}

export async function updateClientScope(
    adminClient: KeycloakAdminClient,
    id: string,
    clientScope: ClientScopeRepresentation
) {
    return adminClient.clientScopes.update({ id }, clientScope);
}

export async function deleteClientScope(adminClient: KeycloakAdminClient, id: string) {
    return adminClient.clientScopes.del({ id });
}

export async function addProtocolMappers(
    adminClient: KeycloakAdminClient,
    id: string,
    mappers: ProtocolMapperRepresentation[]
) {
    return adminClient.clientScopes.addMultipleProtocolMappers({ id }, mappers);
}

export async function deleteProtocolMapper(
    adminClient: KeycloakAdminClient,
    id: string,
    mapperId: string
) {
    return adminClient.clientScopes.delProtocolMapper({ id, mapperId });
}

export async function addRealmScopeMappings(
    adminClient: KeycloakAdminClient,
    id: string,
    roles: RoleMappingPayload[]
) {
    return adminClient.clientScopes.addRealmScopeMappings({ id }, roles);
}

export async function addClientScopeMappings(
    adminClient: KeycloakAdminClient,
    id: string,
    client: string,
    roles: RoleMappingPayload[]
) {
    return adminClient.clientScopes.addClientScopeMappings({ id, client }, roles);
}

export async function findProtocolMapper(
    adminClient: KeycloakAdminClient,
    id: string,
    mapperId: string
) {
    return adminClient.clientScopes.findProtocolMapper({ id, mapperId });
}

export async function findClientProtocolMapper(
    adminClient: KeycloakAdminClient,
    id: string,
    mapperId: string
) {
    return adminClient.clients.findProtocolMapperById({ id, mapperId });
}

export async function updateProtocolMapper(
    adminClient: KeycloakAdminClient,
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
    adminClient: KeycloakAdminClient,
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
    adminClient: KeycloakAdminClient,
    id: string,
    mapping: ProtocolMapperRepresentation
) {
    return adminClient.clientScopes.addProtocolMapper({ id }, mapping);
}

export async function addClientProtocolMapper(
    adminClient: KeycloakAdminClient,
    id: string,
    mapping: ProtocolMapperRepresentation
) {
    return adminClient.clients.addProtocolMapper({ id }, mapping);
}

export async function deleteProtocolMapperFromScope(
    adminClient: KeycloakAdminClient,
    id: string,
    mapperId: string
) {
    return adminClient.clientScopes.delProtocolMapper({ id, mapperId });
}

export async function deleteProtocolMapperFromClient(
    adminClient: KeycloakAdminClient,
    id: string,
    mapperId: string
) {
    return adminClient.clients.delProtocolMapper({ id, mapperId });
}

export async function fetchRealmKeys(adminClient: KeycloakAdminClient, realm: string) {
    const keysMetadata = await adminClient.realms.getKeys({ realm });
    return keysMetadata.keys || [];
}
