import { lazy } from "react";
import type { Path } from "react-router-dom";
import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";
import type { AppRouteObject } from "../../../app/routes";

export type IdentityProviderKeycloakOidcParams = { realm: string };

const AddOpenIdConnect = lazy(() => import("../add/add-open-id-connect"));

export const IdentityProviderKeycloakOidcRoute: AppRouteObject = {
    path: "/:realm/identity-providers/keycloak-oidc/add",
    element: <AddOpenIdConnect />,
    breadcrumb: t => t("addKeycloakOpenIdProvider"),
    handle: {
        access: "manage-identity-providers"
    }
};

export const toIdentityProviderKeycloakOidc = (
    params: IdentityProviderKeycloakOidcParams
): Partial<Path> => ({
    pathname: generateEncodedPath(IdentityProviderKeycloakOidcRoute.path, params)
});
