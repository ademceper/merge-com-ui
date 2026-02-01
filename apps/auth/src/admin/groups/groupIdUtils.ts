/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/groups/groupIdUtils.ts"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

export const getId = (pathname: string) => {
    const pathParts = pathname.substring(1).split("/");
    return pathParts.length > 1 ? pathParts.splice(2) : undefined;
};

export const getLastId = (pathname: string) => {
    const pathParts = getId(pathname);
    return pathParts ? pathParts[pathParts.length - 1] : undefined;
};
