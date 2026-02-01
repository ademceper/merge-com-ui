/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/clients/routes/CreateInitialAccessToken.tsx"
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

export type CreateInitialAccessTokenParams = { realm: string };

const CreateInitialAccessToken = lazy(
    () => import("../initial-access/CreateInitialAccessToken")
);

export const CreateInitialAccessTokenRoute: AppRouteObject = {
    path: "/:realm/clients/initialAccessToken/create",
    element: <CreateInitialAccessToken />,
    breadcrumb: t => t("createToken"),
    handle: {
        access: "manage-clients"
    }
};

export const toCreateInitialAccessToken = (
    params: CreateInitialAccessTokenParams
): Partial<Path> => ({
    pathname: generateEncodedPath(CreateInitialAccessTokenRoute.path, params)
});
