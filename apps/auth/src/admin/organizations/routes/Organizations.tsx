/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/organizations/routes/Organizations.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { lazy } from "react";
import type { Path } from "react-router-dom";
import type { AppRouteObject } from "../../routes";
import { generateEncodedPath } from "../../utils/generateEncodedPath";

type OrganizationsRouteParams = {
    realm: string;
};

const OrganizationsSection = lazy(() => import("../OrganizationsSection"));

export const OrganizationsRoute: AppRouteObject = {
    path: "/:realm/organizations",
    element: <OrganizationsSection />,
    breadcrumb: t => t("organizationsList"),
    handle: {
        access: "query-groups"
    }
};

export const toOrganizations = (params: OrganizationsRouteParams): Partial<Path> => {
    const path = OrganizationsRoute.path;

    return {
        pathname: generateEncodedPath(path, params)
    };
};
