import type ComponentRepresentation from "@keycloak/keycloak-admin-client/lib/defs/componentRepresentation";
import type { ComponentQuery } from "@keycloak/keycloak-admin-client/lib/resources/components";
import { adminClient } from "../app/admin-client";
import { PAGE_PROVIDER } from "../pages/page/constants";
import { TAB_PROVIDER } from "../shared/lib/page-constants";

// ── List / find ──────────────────────────────────────────────────────────

export async function findPageComponents(
    realmId: string
) {
    return adminClient.components.find({
        parent: realmId,
        type: PAGE_PROVIDER
    } as ComponentQuery);
}

export async function findPageComponent(id: string) {
    return adminClient.components.findOne({ id });
}

// ── Mutations ────────────────────────────────────────────────────────────

export async function deletePageComponent(id: string) {
    return adminClient.components.del({ id });
}

export async function savePageComponent(
    id: string | undefined,
    component: ComponentRepresentation
) {
    if (id) {
        await adminClient.components.update({ id }, component);
        return { id };
    }
    return adminClient.components.create(component);
}

// ── Handler data ─────────────────────────────────────────────────────────

export async function findHandlerData(
    id: string | undefined,
    providerType: string,
    providerId: string | undefined
) {
    const [data, tabs] = await Promise.all([
        id ? adminClient.components.findOne({ id }) : Promise.resolve(undefined),
        providerType === TAB_PROVIDER
            ? adminClient.components.find({ type: providerType })
            : Promise.resolve(undefined)
    ]);
    const tab = (tabs || []).find(
        (t: ComponentRepresentation) => t.providerId === providerId
    );
    return { data, tab };
}
