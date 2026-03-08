import type ComponentRepresentation from "@keycloak/keycloak-admin-client/lib/defs/componentRepresentation";
import type TestLdapConnectionRepresentation from "@keycloak/keycloak-admin-client/lib/defs/testLdapConnection";
import type { DirectionType } from "@keycloak/keycloak-admin-client/lib/resources/userStorageProvider";
import { adminClient } from "../app/admin-client";

// ── List / find ──────────────────────────────────────────────────────────

export async function findUserFederationList(
    parentId: string
) {
    const list = await adminClient.components.find({
        parent: parentId,
        type: "org.keycloak.storage.UserStorageProvider"
    });
    return list ?? [];
}

export async function findComponentDetail(id: string) {
    const component = await adminClient.components.findOne({ id });
    if (!component) {
        throw new Error("notFound");
    }
    return component;
}

export async function findLdapMappers(
    parentId: string
) {
    return adminClient.components.find({
        parent: parentId,
        type: "org.keycloak.storage.ldap.mappers.LDAPStorageMapper"
    });
}

export async function findLdapMapperDetail(
    id: string,
    mapperId: string
) {
    const components = await adminClient.components.listSubComponents({
        id,
        type: "org.keycloak.storage.ldap.mappers.LDAPStorageMapper"
    });
    let fetchedMapper: ComponentRepresentation | undefined;
    if (mapperId && mapperId !== "new") {
        fetchedMapper = await adminClient.components.findOne({
            id: mapperId
        });
    }
    return { components, fetchedMapper };
}

export async function findCustomComponent(id: string) {
    return adminClient.components.findOne({ id });
}

// ── Mutations ────────────────────────────────────────────────────────────

export async function deleteComponent(id: string) {
    return adminClient.components.del({ id });
}

export async function updateComponent(
    id: string,
    component: ComponentRepresentation
) {
    return adminClient.components.update({ id }, component);
}

export async function createComponent(
    component: ComponentRepresentation
) {
    return adminClient.components.create(component);
}

export async function syncUsers(
    id: string,
    action: "triggerChangedUsersSync" | "triggerFullSync"
) {
    return adminClient.userStorageProvider.sync({ id, action });
}

export async function unlinkUsers(id: string) {
    return adminClient.userStorageProvider.unlinkUsers({ id });
}

export async function removeImportedUsers(id: string) {
    return adminClient.userStorageProvider.removeImportedUsers({ id });
}

export async function syncMappers(
    parentId: string,
    id: string,
    direction: DirectionType
) {
    return adminClient.userStorageProvider.mappersSync({
        parentId,
        id,
        direction
    });
}

export async function testLdapConnection(
    realm: string,
    settings: TestLdapConnectionRepresentation & {
        action: string;
        componentId?: string;
    }
) {
    return adminClient.realms.testLDAPConnection({ realm }, settings);
}

export async function fetchLdapServerCapabilities(
    realm: string,
    settings: TestLdapConnectionRepresentation & { componentId?: string }
) {
    return adminClient.realms.ldapServerCapabilities({ realm }, settings);
}

export async function updateComponentPriorities(
    updates: { id: string; component: ComponentRepresentation }[]
) {
    return Promise.all(
        updates.map(({ id, component }) =>
            adminClient.components.update({ id }, component)
        )
    );
}
