/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/user/routes/Users.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { lazy } from "react";
import { generateEncodedPath } from "../../utils/generateEncodedPath";
import type { Path } from "react-router-dom";
import type { AppRouteObject } from "../../routes";

export type UserTab = "list" | "permissions";

export type UsersParams = { realm: string; tab?: UserTab };

const UsersSection = lazy(() => import("../UsersSection"));

export const UsersRoute: AppRouteObject = {
    path: "/:realm/users",
    element: <UsersSection />,
    breadcrumb: t => t("titleUsers"),
    handle: {
        access: "query-users"
    }
};

export const UsersRouteWithTab: AppRouteObject = {
    ...UsersRoute,
    path: "/:realm/users/:tab"
};

export const toUsers = (params: UsersParams): Partial<Path> => {
    const path = params.tab ? UsersRouteWithTab.path : UsersRoute.path;

    return {
        pathname: generateEncodedPath(path, params)
    };
};
