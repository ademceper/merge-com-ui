/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/identity-providers/routes/IdentityProviderOAuth2.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { lazy } from "react";
import type { AppRouteObject } from "../../routes";

const AddOAuth2 = lazy(() => import("../add/AddOAuth2"));

export const IdentityProviderOAuth2Route: AppRouteObject = {
    path: "/:realm/identity-providers/oauth2/add",
    element: <AddOAuth2 />,
    breadcrumb: t => t("addOAuth2Provider"),
    handle: {
        access: "manage-identity-providers"
    }
};
