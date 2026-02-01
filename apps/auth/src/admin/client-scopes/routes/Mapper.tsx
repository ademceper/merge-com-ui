/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/client-scopes/routes/Mapper.tsx"
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

export type MapperParams = {
    realm: string;
    id: string;
    mapperId: string;
    viewMode: "edit" | "new";
};

const MappingDetails = lazy(() => import("../details/MappingDetails"));

export const MapperRoute: AppRouteObject = {
    path: "/:realm/client-scopes/:id/mappers/:mapperId/:viewMode",
    element: <MappingDetails />,
    breadcrumb: t => t("mappingDetails"),
    handle: {
        access: "view-clients"
    }
};

export const toMapper = (params: MapperParams): Partial<Path> => ({
    pathname: generateEncodedPath(MapperRoute.path, params)
});
