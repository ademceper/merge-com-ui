/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/realm-settings/routes/NewAttributesGroup.tsx"
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

export type NewAttributesGroupParams = {
    realm: string;
};

const AttributesGroupDetails = lazy(
    () => import("../user-profile/AttributesGroupDetails")
);

export const NewAttributesGroupRoute: AppRouteObject = {
    path: "/:realm/realm-settings/user-profile/attributesGroup/new",
    element: <AttributesGroupDetails />,
    breadcrumb: t => t("createGroupText"),
    handle: {
        access: "view-realm"
    }
};

export const toNewAttributesGroup = (
    params: NewAttributesGroupParams
): Partial<Path> => ({
    pathname: generateEncodedPath(NewAttributesGroupRoute.path, params)
});
