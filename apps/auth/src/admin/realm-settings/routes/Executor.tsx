/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/realm-settings/routes/Executor.tsx"
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

export type ExecutorParams = {
    realm: string;
    profileName: string;
    executorName: string;
};

const ExecutorForm = lazy(() => import("../ExecutorForm"));

export const ExecutorRoute: AppRouteObject = {
    path: "/:realm/realm-settings/client-policies/:profileName/edit-profile/:executorName",
    element: <ExecutorForm />,
    breadcrumb: t => t("executorDetails"),
    handle: {
        access: ["manage-realm"]
    }
};

export const toExecutor = (params: ExecutorParams): Partial<Path> => ({
    pathname: generateEncodedPath(ExecutorRoute.path, params)
});
