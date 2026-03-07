import { lazy } from "react";
import type { Path } from "react-router-dom";
import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";
import type { AppRouteObject } from "../../../app/routes";

export type UserFederationParams = { realm: string };

const UserFederationSection = lazy(() => import("../user-federation-section"));

export const UserFederationRoute: AppRouteObject = {
    path: "/:realm/user-federation",
    element: <UserFederationSection />,
    breadcrumb: t => t("userFederation"),
    handle: {
        access: "view-realm"
    }
};

export const toUserFederation = (params: UserFederationParams): Partial<Path> => ({
    pathname: generateEncodedPath(UserFederationRoute.path, params)
});
