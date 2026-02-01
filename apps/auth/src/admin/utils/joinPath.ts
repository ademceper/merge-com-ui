/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/utils/joinPath.ts"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

const PATH_SEPARATOR = "/";

export function joinPath(...paths: string[]) {
    const normalizedPaths = paths.map((path, index) => {
        const isFirst = index === 0;
        const isLast = index === paths.length - 1;

        // Strip out any leading slashes from the path.
        if (!isFirst && path.startsWith(PATH_SEPARATOR)) {
            path = path.slice(1);
        }

        // Strip out any trailing slashes from the path.
        if (!isLast && path.endsWith(PATH_SEPARATOR)) {
            path = path.slice(0, -1);
        }

        return path;
    }, []);

    return normalizedPaths.join(PATH_SEPARATOR);
}
