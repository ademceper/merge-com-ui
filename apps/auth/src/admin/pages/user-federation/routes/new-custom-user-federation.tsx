import { lazy } from "react";
import type { Path } from "react-router-dom";
import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";

import type { AppRouteObject } from "../../../app/routes";

export type NewCustomUserFederationRouteParams = {
    realm: string;
    providerId: string;
};

const CustomProviderSettings = lazy(() => import("../custom/custom-provider-settings"));

export const NewCustomUserFederationRoute: AppRouteObject = {
    path: "/:realm/user-federation/:providerId/new",
    element: <CustomProviderSettings />,
    breadcrumb: t => t("addCustomProvider"),
    handle: {
        access: "view-realm"
    }
};

export const toNewCustomUserFederation = (
    params: NewCustomUserFederationRouteParams
): Partial<Path> => ({
    pathname: generateEncodedPath(NewCustomUserFederationRoute.path, params)
});
