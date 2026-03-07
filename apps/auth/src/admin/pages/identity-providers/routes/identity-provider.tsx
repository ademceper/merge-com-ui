import { lazy } from "react";
import type { Path } from "react-router-dom";
import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";
import type { AppRouteObject } from "../../../app/routes";

export type IdentityProviderTab = "settings" | "mappers" | "permissions" | "events";

export type IdentityProviderParams = {
    realm: string;
    providerId: string;
    alias: string;
    tab: IdentityProviderTab;
};

const DetailSettings = lazy(() => import("../add/detail-settings"));

export const IdentityProviderRoute: AppRouteObject = {
    path: "/:realm/identity-providers/:providerId/:alias/:tab",
    element: <DetailSettings />,
    breadcrumb: t => t("providerDetails"),
    handle: {
        access: "view-identity-providers"
    }
};

export const toIdentityProvider = (params: IdentityProviderParams): Partial<Path> => ({
    pathname: generateEncodedPath(IdentityProviderRoute.path, params)
});
