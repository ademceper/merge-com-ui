import { lazy } from "react";
import type { Path } from "react-router-dom";
import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";
import type { AppRouteObject } from "../../../app/routes";
import type { PermissionType } from "./new-permission";

export type PermissionDetailsParams = {
    realm: string;
    id: string;
    permissionType: string | PermissionType;
    permissionId: string;
};

const PermissionDetails = lazy(() => import("../authorization/permission-details"));

export const PermissionDetailsRoute: AppRouteObject = {
    path: "/:realm/clients/:id/authorization/permission/:permissionType/:permissionId",
    element: <PermissionDetails />,
    breadcrumb: t => t("permissionDetails"),
    handle: {
        access: accessChecker =>
            accessChecker.hasAny(
                "manage-clients",
                "view-authorization",
                "manage-authorization"
            )
    }
};

export const toPermissionDetails = (params: PermissionDetailsParams): Partial<Path> => ({
    pathname: generateEncodedPath(PermissionDetailsRoute.path, params)
});
