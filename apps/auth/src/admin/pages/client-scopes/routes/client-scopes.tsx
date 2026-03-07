import { lazy } from "react";
import type { Path } from "react-router-dom";
import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";
import type { AppRouteObject } from "../../../app/routes";

export type ClientScopesParams = { realm: string };

const ClientScopesSection = lazy(() => import("../client-scopes-section"));

export const ClientScopesRoute: AppRouteObject = {
    path: "/:realm/client-scopes",
    element: <ClientScopesSection />,
    breadcrumb: t => t("clientScopeList"),
    handle: {
        access: "view-clients"
    }
};

export const toClientScopes = (params: ClientScopesParams): Partial<Path> => ({
    pathname: generateEncodedPath(ClientScopesRoute.path, params)
});
