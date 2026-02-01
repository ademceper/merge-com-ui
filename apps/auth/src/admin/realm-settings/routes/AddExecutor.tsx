/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/realm-settings/routes/AddExecutor.tsx"
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

export type AddExecutorParams = {
    realm: string;
    profileName: string;
};

const ExecutorForm = lazy(() => import("../ExecutorForm"));

export const AddExecutorRoute: AppRouteObject = {
    path: "/:realm/realm-settings/client-policies/:profileName/add-executor",
    element: <ExecutorForm />,
    breadcrumb: t => t("addExecutor"),
    handle: {
        access: "manage-realm"
    }
};

export const toAddExecutor = (params: AddExecutorParams): Partial<Path> => ({
    pathname: generateEncodedPath(AddExecutorRoute.path, params)
});
