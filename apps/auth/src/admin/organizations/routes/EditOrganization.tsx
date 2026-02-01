/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/organizations/routes/EditOrganization.tsx"
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

export type OrganizationTab =
    | "settings"
    | "attributes"
    | "members"
    | "identityProviders"
    | "events";

export type EditOrganizationParams = {
    realm: string;
    id: string;
    tab: OrganizationTab;
};

const DetailOrganization = lazy(() => import("../DetailOrganization"));

export const EditOrganizationRoute: AppRouteObject = {
    path: "/:realm/organizations/:id/:tab",
    element: <DetailOrganization />,
    breadcrumb: t => t("organizationDetails"),
    handle: {
        access: "manage-users"
    }
};

export const toEditOrganization = (params: EditOrganizationParams): Partial<Path> => ({
    pathname: generateEncodedPath(EditOrganizationRoute.path, params)
});
