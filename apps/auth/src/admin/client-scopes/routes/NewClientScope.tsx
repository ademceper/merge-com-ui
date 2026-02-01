/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/client-scopes/routes/NewClientScope.tsx"
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

export type NewClientScopeParams = { realm: string };

const CreateClientScope = lazy(() => import("../CreateClientScope"));

export const NewClientScopeRoute: AppRouteObject = {
    path: "/:realm/client-scopes/new",
    element: <CreateClientScope />,
    breadcrumb: t => t("createClientScope"),
    handle: {
        access: "manage-clients"
    }
};

export const toNewClientScope = (params: NewClientScopeParams): Partial<Path> => ({
    pathname: generateEncodedPath(NewClientScopeRoute.path, params)
});
