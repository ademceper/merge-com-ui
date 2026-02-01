/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/clients/routes/NewResource.tsx"
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

export type NewResourceParams = { realm: string; id: string };

const ResourceDetails = lazy(() => import("../authorization/ResourceDetails"));

export const NewResourceRoute: AppRouteObject = {
    path: "/:realm/clients/:id/authorization/resource/new",
    element: <ResourceDetails />,
    breadcrumb: t => t("createResource"),
    handle: {
        access: accessChecker =>
            accessChecker.hasAny("manage-clients", "manage-authorization")
    }
};

export const toCreateResource = (params: NewResourceParams): Partial<Path> => ({
    pathname: generateEncodedPath(NewResourceRoute.path, params)
});
