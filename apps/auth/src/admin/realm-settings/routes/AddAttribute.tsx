/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/realm-settings/routes/AddAttribute.tsx"
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

export type AddAttributeParams = {
    realm: string;
};

const NewAttributeSettings = lazy(() => import("../NewAttributeSettings"));

export const AddAttributeRoute: AppRouteObject = {
    path: "/:realm/realm-settings/user-profile/attributes/add-attribute",
    element: <NewAttributeSettings />,
    breadcrumb: t => t("createAttribute"),
    handle: {
        access: "manage-realm"
    }
};

export const toAddAttribute = (params: AddAttributeParams): Partial<Path> => ({
    pathname: generateEncodedPath(AddAttributeRoute.path, params)
});
