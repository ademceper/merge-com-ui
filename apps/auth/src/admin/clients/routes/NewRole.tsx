/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/clients/routes/NewRole.tsx"
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

export type NewRoleParams = { realm: string; clientId: string };

const CreateClientRole = lazy(() => import("../roles/CreateClientRole"));

export const NewRoleRoute: AppRouteObject = {
    path: "/:realm/clients/:clientId/roles/new",
    element: <CreateClientRole />,
    breadcrumb: t => t("createRole"),
    handle: {
        access: "query-clients"
    }
};

export const toCreateRole = (params: NewRoleParams): Partial<Path> => ({
    pathname: generateEncodedPath(NewRoleRoute.path, params)
});
