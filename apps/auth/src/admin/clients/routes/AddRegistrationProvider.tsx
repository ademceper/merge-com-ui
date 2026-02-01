/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/clients/routes/AddRegistrationProvider.tsx"
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
import { ClientRegistrationTab } from "./ClientRegistration";

export type RegistrationProviderParams = {
    realm: string;
    subTab: ClientRegistrationTab;
    id?: string;
    providerId: string;
};

const DetailProvider = lazy(() => import("../registration/DetailProvider"));

export const AddRegistrationProviderRoute: AppRouteObject = {
    path: "/:realm/clients/client-registration/:subTab/:providerId",
    element: <DetailProvider />,
    breadcrumb: t => t("clientSettings"),
    handle: {
        access: "manage-clients"
    }
};

export const EditRegistrationProviderRoute: AppRouteObject = {
    ...AddRegistrationProviderRoute,
    path: "/:realm/clients/client-registration/:subTab/:providerId/:id"
};

export const toRegistrationProvider = (
    params: RegistrationProviderParams
): Partial<Path> => {
    const path = params.id
        ? EditRegistrationProviderRoute.path
        : AddRegistrationProviderRoute.path;

    return {
        pathname: generateEncodedPath(path, params)
    };
};
