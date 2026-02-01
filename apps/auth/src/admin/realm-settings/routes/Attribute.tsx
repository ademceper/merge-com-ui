/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/realm-settings/routes/Attribute.tsx"
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

export type AttributeParams = {
    realm: string;
    attributeName: string;
};

const NewAttributeSettings = lazy(() => import("../NewAttributeSettings"));

export const AttributeRoute: AppRouteObject = {
    path: "/:realm/realm-settings/user-profile/attributes/:attributeName/edit-attribute",
    element: <NewAttributeSettings />,
    breadcrumb: t => t("editAttribute"),
    handle: {
        access: "manage-realm"
    }
};

export const toAttribute = (params: AttributeParams): Partial<Path> => ({
    pathname: generateEncodedPath(AttributeRoute.path, params)
});
