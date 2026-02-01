/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/clients/routes/ClientRegistration.tsx"
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

export type ClientRegistrationTab = "anonymous" | "authenticated";

export type ClientRegistrationParams = {
    realm: string;
    subTab: ClientRegistrationTab;
};

const ClientsSection = lazy(() => import("../ClientsSection"));

export const ClientRegistrationRoute: AppRouteObject = {
    path: "/:realm/clients/client-registration/:subTab",
    element: <ClientsSection />,
    breadcrumb: t => t("clientRegistration"),
    handle: {
        access: "view-clients"
    }
};

export const toClientRegistration = (
    params: ClientRegistrationParams
): Partial<Path> => ({
    pathname: generateEncodedPath(ClientRegistrationRoute.path, params)
});
