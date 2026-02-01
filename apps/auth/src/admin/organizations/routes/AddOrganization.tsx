/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/organizations/routes/AddOrganization.tsx"
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

export type AddOrganizationParams = { realm: string };

const NewOrganization = lazy(() => import("../NewOrganization"));

export const AddOrganizationRoute: AppRouteObject = {
    path: "/:realm/organizations/new",
    element: <NewOrganization />,
    breadcrumb: t => t("createOrganization"),
    handle: {
        access: "manage-users"
    }
};

export const toAddOrganization = (params: AddOrganizationParams): Partial<Path> => ({
    pathname: generateEncodedPath(AddOrganizationRoute.path, params)
});
