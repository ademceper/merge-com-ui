/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/identity-providers/routes/IdentityProviderSaml.tsx"
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

export type IdentityProviderSamlParams = { realm: string };

const AddSamlConnect = lazy(() => import("../add/AddSamlConnect"));

export const IdentityProviderSamlRoute: AppRouteObject = {
    path: "/:realm/identity-providers/saml/add",
    element: <AddSamlConnect />,
    breadcrumb: t => t("addSamlProvider"),
    handle: {
        access: "manage-identity-providers"
    }
};

export const toIdentityProviderSaml = (
    params: IdentityProviderSamlParams
): Partial<Path> => ({
    pathname: generateEncodedPath(IdentityProviderSamlRoute.path, params)
});
