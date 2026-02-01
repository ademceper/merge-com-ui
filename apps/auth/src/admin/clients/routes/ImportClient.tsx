/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/clients/routes/ImportClient.tsx"
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

export type ImportClientParams = { realm: string };

const ImportForm = lazy(() => import("../import/ImportForm"));

export const ImportClientRoute: AppRouteObject = {
    path: "/:realm/clients/import-client",
    element: <ImportForm />,
    breadcrumb: t => t("importClient"),
    handle: {
        access: "manage-clients"
    }
};

export const toImportClient = (params: ImportClientParams): Partial<Path> => ({
    pathname: generateEncodedPath(ImportClientRoute.path, params)
});
