import { lazy } from "react";
import type { Path } from "react-router-dom";
import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";
import type { AppRouteObject } from "../../../app/routes";

export type PermissionsConfigurationParams = { realm: string };

const PermissionsConfigurationSection = lazy(
    () => import("../permissions-configuration-section")
);

export const PermissionsConfigurationRoute: AppRouteObject = {
    path: "/:realm/permissions",
    element: <PermissionsConfigurationSection />,
    breadcrumb: t => t("titlePermissions"),
    handle: {
        access: ["view-realm", "view-clients", "view-users"]
    }
};

export const toPermissionsConfiguration = (
    params: PermissionsConfigurationParams
): Partial<Path> => ({
    pathname: generateEncodedPath(PermissionsConfigurationRoute.path, params)
});
