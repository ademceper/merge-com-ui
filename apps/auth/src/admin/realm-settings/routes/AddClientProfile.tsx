/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/realm-settings/routes/AddClientProfile.tsx"
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

export type AddClientProfileParams = {
    realm: string;
    tab: string;
};

const ClientProfileForm = lazy(() => import("../ClientProfileForm"));

export const AddClientProfileRoute: AppRouteObject = {
    path: "/:realm/realm-settings/client-policies/:tab/add-profile",
    element: <ClientProfileForm />,
    breadcrumb: t => t("newClientProfile"),
    handle: {
        access: "manage-realm"
    }
};

export const toAddClientProfile = (params: AddClientProfileParams): Partial<Path> => ({
    pathname: generateEncodedPath(AddClientProfileRoute.path, params)
});
