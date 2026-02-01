/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/realm-settings/routes/EditAttributesGroup.tsx"
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

export type EditAttributesGroupParams = {
    realm: string;
    name: string;
};

const AttributesGroupDetails = lazy(
    () => import("../user-profile/AttributesGroupDetails")
);

export const EditAttributesGroupRoute: AppRouteObject = {
    path: "/:realm/realm-settings/user-profile/attributesGroup/edit/:name",
    element: <AttributesGroupDetails />,
    breadcrumb: t => t("editGroupText"),
    handle: {
        access: "view-realm"
    }
};

export const toEditAttributesGroup = (
    params: EditAttributesGroupParams
): Partial<Path> => ({
    pathname: generateEncodedPath(EditAttributesGroupRoute.path, params)
});
