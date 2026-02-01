/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/clients/routes/AddClient.tsx"
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

export type AddClientParams = { realm: string };

const NewClientForm = lazy(() => import("../add/NewClientForm"));

export const AddClientRoute: AppRouteObject = {
    path: "/:realm/clients/add-client",
    element: <NewClientForm />,
    breadcrumb: t => t("createClient"),
    handle: {
        access: "manage-clients"
    }
};

export const toAddClient = (params: AddClientParams): Partial<Path> => ({
    pathname: generateEncodedPath(AddClientRoute.path, params)
});
