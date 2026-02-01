/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/realm-settings/routes/ClientPolicies.tsx"
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

export type ClientPoliciesTab = "profiles" | "policies";

export type ClientPoliciesParams = {
    realm: string;
    tab: ClientPoliciesTab;
};

const RealmSettingsSection = lazy(() => import("../RealmSettingsSection"));

export const ClientPoliciesRoute: AppRouteObject = {
    path: "/:realm/realm-settings/client-policies/:tab",
    element: <RealmSettingsSection />,
    breadcrumb: t => t("clientPolicies"),
    handle: {
        access: "view-realm"
    }
};

export const toClientPolicies = (params: ClientPoliciesParams): Partial<Path> => ({
    pathname: generateEncodedPath(ClientPoliciesRoute.path, params)
});
