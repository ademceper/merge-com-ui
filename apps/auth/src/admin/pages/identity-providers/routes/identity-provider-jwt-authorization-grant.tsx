import { lazy } from "react";
import type { Path } from "react-router-dom";
import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";
import type { AppRouteObject } from "../../../app/routes";

export type IdentityProviderJWTAuthorizationGrantParams = { realm: string };

const AddJWTAuthorizationGrant = lazy(() => import("../add/add-jwt-authorization-grant"));

export const IdentityProviderJWTAuthorizationGrantRoute: AppRouteObject = {
    path: "/:realm/identity-providers/jwt-authorization-grant/add",
    element: <AddJWTAuthorizationGrant />,
    breadcrumb: t => t("addJWTAuthorizationGrantProvider"),
    handle: {
        access: "manage-identity-providers"
    }
};

export const toIdentityProviderJWTAuthorizationGrant = (
    params: IdentityProviderJWTAuthorizationGrantParams
): Partial<Path> => ({
    pathname: generateEncodedPath(IdentityProviderJWTAuthorizationGrantRoute.path, params)
});
