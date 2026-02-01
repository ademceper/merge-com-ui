/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/realm-settings/routes/ClientProfile.tsx"
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

export type ClientProfileParams = {
    realm: string;
    profileName: string;
};

const ClientProfileForm = lazy(() => import("../ClientProfileForm"));

export const ClientProfileRoute: AppRouteObject = {
    path: "/:realm/realm-settings/client-policies/:profileName/edit-profile",
    element: <ClientProfileForm />,
    breadcrumb: t => t("clientProfile"),
    handle: {
        access: ["view-realm", "view-users"]
    }
};

export const toClientProfile = (params: ClientProfileParams): Partial<Path> => ({
    pathname: generateEncodedPath(ClientProfileRoute.path, params)
});
