/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/utils/client-url.ts"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import ClientRepresentation from "@keycloak/keycloak-admin-client/lib/defs/clientRepresentation";
import type { Environment } from "../environment";
import { joinPath } from "./joinPath";

export const convertClientToUrl = (
    { rootUrl, baseUrl }: ClientRepresentation,
    environment: Environment
) => {
    // absolute base url configured, use base url is
    if (baseUrl?.startsWith("http")) {
        return baseUrl;
    }

    if (rootUrl === "${authAdminUrl}") {
        return joinPath(
            rootUrl.replace(/\$\{(authAdminUrl)\}/, environment.adminBaseUrl),
            baseUrl || ""
        );
    }

    if (rootUrl === "${authBaseUrl}") {
        return joinPath(
            rootUrl.replace(/\$\{(authBaseUrl)\}/, environment.serverBaseUrl),
            baseUrl || ""
        );
    }

    if (rootUrl?.startsWith("http")) {
        if (baseUrl) {
            return joinPath(rootUrl, baseUrl);
        }
        return rootUrl;
    }

    return baseUrl;
};
