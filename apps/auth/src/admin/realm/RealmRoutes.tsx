/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/realm/RealmRoutes.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { lazy } from "react";
import type { Path } from "react-router-dom";
import { generateEncodedPath } from "../utils/generateEncodedPath";
import type { AppRouteObject } from "../routes";

export type RealmParams = { realm: string };

const RealmSection = lazy(() => import("./RealmSection"));

export const RealmRoute: AppRouteObject = {
    path: "/:realm/realms",
    element: <RealmSection />,
    breadcrumb: t => t("realms"),
    handle: {
        access: "anyone"
    }
};

export const toRealm = (params: RealmParams): Partial<Path> => ({
    pathname: generateEncodedPath(RealmRoute.path, params)
});
