/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/realm-roles/routes/AddRole.tsx"
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

export type AddRoleParams = { realm: string };

const CreateRealmRole = lazy(() => import("../CreateRealmRole"));

export const AddRoleRoute: AppRouteObject = {
    path: "/:realm/roles/new",
    element: <CreateRealmRole />,
    breadcrumb: t => t("createRole"),
    handle: {
        access: "manage-realm"
    }
};

export const toAddRole = (params: AddRoleParams): Partial<Path> => ({
    pathname: generateEncodedPath(AddRoleRoute.path, params)
});
