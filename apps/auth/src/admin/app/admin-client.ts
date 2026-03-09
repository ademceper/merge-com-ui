import KeycloakAdminClient from "@keycloak/keycloak-admin-client";
import type { Keycloak } from "oidc-spa/keycloak-js";
import { createNamedContext, useRequiredContext } from "@/shared/keycloak-ui-shared";
import type { Environment } from "./environment";

// Module-level singleton – set once by initAdminClient, imported directly by API layer.
export let adminClient: KeycloakAdminClient;

type AdminClientProps = {
    keycloak: Keycloak;
    adminClient: KeycloakAdminClient;
};

export const AdminClientContext = createNamedContext<AdminClientProps | undefined>(
    "AdminClientContext",
    undefined
);

export const useAdminClient = () => useRequiredContext(AdminClientContext);

export async function initAdminClient(keycloak: Keycloak, environment: Environment) {
    const client = new KeycloakAdminClient();

    client.setConfig({ realmName: environment.realm });
    client.baseUrl = environment.adminBaseUrl;
    client.registerTokenProvider({
        async getAccessToken() {
            // oidc-spa handles token refresh internally (including redirects on failure).
            // Do NOT call keycloak.login() as a fallback — it causes a double-redirect
            // that manifests as a full page refresh.
            await keycloak.updateToken(5);
            return keycloak.token;
        }
    });

    adminClient = client;
    return client;
}
