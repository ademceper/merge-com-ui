import { lazy } from "react";
import type { Path } from "react-router-dom";
import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";
import type { AppRouteObject } from "../../../app/routes";

export type RealmRolesParams = { realm: string };

const RealmRolesSection = lazy(() => import("../realm-roles-section"));

export const RealmRolesRoute: AppRouteObject = {
    path: "/:realm/roles",
    element: <RealmRolesSection />,
    breadcrumb: t => t("realmRolesList"),
    handle: {
        access: "view-realm"
    }
};

export const toRealmRoles = (params: RealmRolesParams): Partial<Path> => ({
    pathname: generateEncodedPath(RealmRolesRoute.path, params)
});
