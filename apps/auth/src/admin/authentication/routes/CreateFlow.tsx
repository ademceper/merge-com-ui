/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/authentication/routes/CreateFlow.tsx"
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

export type CreateFlowParams = { realm: string };

const CreateFlow = lazy(() => import("../form/CreateFlow"));

export const CreateFlowRoute: AppRouteObject = {
    path: "/:realm/authentication/flows/create",
    element: <CreateFlow />,
    breadcrumb: t => t("createFlow"),
    handle: {
        access: "manage-authorization"
    }
};

export const toCreateFlow = (params: CreateFlowParams): Partial<Path> => ({
    pathname: generateEncodedPath(CreateFlowRoute.path, params)
});
