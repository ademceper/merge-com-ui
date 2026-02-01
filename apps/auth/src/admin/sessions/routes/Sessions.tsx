/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/sessions/routes/Sessions.tsx"
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

export type SessionsParams = { realm: string };

const SessionsSection = lazy(() => import("../SessionsSection"));

export const SessionsRoute: AppRouteObject = {
    path: "/:realm/sessions",
    element: <SessionsSection />,
    breadcrumb: t => t("titleSessions"),
    handle: {
        access: ["view-realm", "view-clients", "view-users"]
    }
};

export const toSessions = (params: SessionsParams): Partial<Path> => ({
    pathname: generateEncodedPath(SessionsRoute.path, params)
});
