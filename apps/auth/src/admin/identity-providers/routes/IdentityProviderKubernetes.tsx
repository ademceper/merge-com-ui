/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/identity-providers/routes/IdentityProviderKubernetes.tsx"
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

export type IdentityProviderKubernetesParams = { realm: string };

const AddKubernetesConnect = lazy(() => import("../add/AddKubernetesConnect"));

export const IdentityProviderKubernetesRoute: AppRouteObject = {
    path: "/:realm/identity-providers/kubernetes/add",
    element: <AddKubernetesConnect />,
    breadcrumb: t => t("addKubernetesProvider"),
    handle: {
        access: "manage-identity-providers"
    }
};

export const toIdentityProviderKubernetes = (
    params: IdentityProviderKubernetesParams
): Partial<Path> => ({
    pathname: generateEncodedPath(IdentityProviderKubernetesRoute.path, params)
});
