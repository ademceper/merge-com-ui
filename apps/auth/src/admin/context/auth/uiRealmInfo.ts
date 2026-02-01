/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/context/auth/uiRealmInfo.ts"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

/** Information about a realm, which is available for all admins of the realm */
export interface UiRealmInfo {
    /** Whether at least one user storage provider is enabled */
    userProfileProvidersEnabled?: boolean;
}
