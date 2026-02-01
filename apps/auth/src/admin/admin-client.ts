/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/admin-client.ts"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import KeycloakAdminClient from "@keycloak/keycloak-admin-client";
import { createNamedContext, useRequiredContext } from "../shared/keycloak-ui-shared";
import type { Keycloak } from "oidc-spa/keycloak-js";
import type { Environment } from "./environment";

export type AdminClientProps = {
    keycloak: Keycloak;
    adminClient: KeycloakAdminClient;
};

export const AdminClientContext = createNamedContext<AdminClientProps | undefined>(
    "AdminClientContext",
    undefined
);

export const useAdminClient = () => useRequiredContext(AdminClientContext);

export async function initAdminClient(keycloak: Keycloak, environment: Environment) {
    const adminClient = new KeycloakAdminClient();

    adminClient.setConfig({ realmName: environment.realm });
    adminClient.baseUrl = environment.adminBaseUrl;
    adminClient.registerTokenProvider({
        async getAccessToken() {
            try {
                await keycloak.updateToken(5);
            } catch {
                await keycloak.login();
            }

            return keycloak.token;
        }
    });

    return adminClient;
}
