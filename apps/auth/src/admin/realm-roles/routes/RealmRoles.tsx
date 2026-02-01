/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/realm-roles/routes/RealmRoles.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { lazy } from "react";
import type { Path } from "react-router-dom";
import { generateEncodedPath } from "../../utils/generateEncodedPath";
import type { AppRouteObject } from "../../routes";

export type RealmRolesParams = { realm: string };

const RealmRolesSection = lazy(() => import("../RealmRolesSection"));

export const RealmRolesRoute: AppRouteObject = {
    path: "/:realm/roles",
    element: <RealmRolesSection />,
    breadcrumb: t => t("realmRolesList"),
    handle: {
        access: "view-realm"
    }
};

export const toRealmRoles = (params: RealmRolesParams): Partial<Path> => ({
    pathname: generateEncodedPath(RealmRolesRoute.path, params)
});
