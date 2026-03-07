import type { AccessType } from "@keycloak/keycloak-admin-client/lib/defs/whoAmIRepresentation";
import type { TFunction } from "i18next";
import type { ComponentType } from "react";
import type { NonIndexRouteObject, RouteObject } from "react-router-dom";
import { CatchAllRoute } from "../pages/catch-all-route";
import { Root } from "./root";
import authenticationRoutes from "../pages/authentication/routes";
import clientScopesRoutes from "../pages/client-scopes/routes";
import clientRoutes from "../pages/clients/routes";
import dashboardRoutes from "../pages/dashboard/routes";
import eventRoutes from "../pages/events/routes";
import groupsRoutes from "../pages/groups/routes";
import identityProviders from "../pages/identity-providers/routes";
import organizationRoutes from "../pages/organizations/routes";
import pageRoutes from "../pages/page/routes";
import permissionsConfigurationRoute from "../pages/permissions-configuration/routes";
import realmRoleRoutes from "../pages/realm-roles/routes";
import realmSettingRoutes from "../pages/realm-settings/routes";
import realmRoutes from "../pages/realm/routes";
import sessionRoutes from "../pages/sessions/routes";
import userFederationRoutes from "../pages/user-federation/routes";
import userRoutes from "../pages/user/routes";
import workflowRoutes from "../pages/workflows/routes";

export type AppRouteObjectHandle = {
    access: AccessType | AccessType[];
    isNotFound?: true;
};

export interface AppRouteObject extends NonIndexRouteObject {
    path: string;
    breadcrumb?: (t: TFunction) => string | ComponentType<any>;
    handle: AppRouteObjectHandle;
}

export const NotFoundRoute: AppRouteObject = {
    path: "*",
    element: <CatchAllRoute />,
    handle: {
        access: "anyone",
        isNotFound: true
    }
};

export const routes: AppRouteObject[] = [
    ...authenticationRoutes,
    ...clientRoutes,
    ...clientScopesRoutes,
    ...eventRoutes,
    ...identityProviders,
    ...organizationRoutes,
    ...realmRoleRoutes,
    ...workflowRoutes,
    ...realmRoutes,
    ...realmSettingRoutes,
    ...sessionRoutes,
    ...userFederationRoutes,
    ...permissionsConfigurationRoute,
    ...userRoutes,
    ...groupsRoutes,
    ...dashboardRoutes,
    ...pageRoutes,
    NotFoundRoute
];

export const RootRoute: RouteObject = {
    path: "/",
    element: <Root />,
    children: routes
};
