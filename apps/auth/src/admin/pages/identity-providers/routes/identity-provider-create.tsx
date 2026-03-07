import { lazy } from "react";
import type { Path } from "react-router-dom";
import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";
import type { AppRouteObject } from "../../../app/routes";

export type IdentityProviderCreateParams = {
    realm: string;
    providerId: string;
};

const AddIdentityProvider = lazy(() => import("../add/add-identity-provider"));

export const IdentityProviderCreateRoute: AppRouteObject = {
    path: "/:realm/identity-providers/:providerId/add",
    element: <AddIdentityProvider />,
    breadcrumb: t => t("addProvider"),
    handle: {
        access: "manage-identity-providers"
    }
};

export const toIdentityProviderCreate = (
    params: IdentityProviderCreateParams
): Partial<Path> => ({
    pathname: generateEncodedPath(IdentityProviderCreateRoute.path, params)
});
