import type { AccessType } from "@keycloak/keycloak-admin-client/lib/defs/whoAmIRepresentation";
import type { TFunction } from "@merge-rd/i18n";
import type { ComponentType, ReactNode } from "react";

export type AppRouteObjectHandle = {
    access: AccessType | AccessType[];
    isNotFound?: true;
};

export interface AppRouteObject {
    path: string;
    breadcrumb?: (t: TFunction) => string | ComponentType<any>;
    handle: AppRouteObjectHandle;
    element?: ReactNode;
}

// Routes array is no longer used for routing (handled by TanStack Router file-based routing)
// but kept for access control lookups in the sidebar navigation.
export const routes: AppRouteObject[] = [
    { path: "/organizations", handle: { access: "view-realm" } },
    { path: "/clients", handle: { access: "query-clients" } },
    { path: "/client-scopes", handle: { access: "view-realm" } },
    { path: "/roles", handle: { access: "view-realm" } },
    { path: "/users", handle: { access: "query-users" } },
    { path: "/groups", handle: { access: "query-groups" } },
    { path: "/permissions", handle: { access: "view-realm" } },
    { path: "/authentication", handle: { access: "view-realm" } },
    { path: "/identity-providers", handle: { access: "view-identity-providers" } },
    { path: "/user-federation", handle: { access: "view-realm" } },
    { path: "/sessions", handle: { access: "view-realm" } },
    { path: "/events", handle: { access: "view-events" } },
    { path: "/realm-settings", handle: { access: "view-realm" } },
    { path: "/realms", handle: { access: "view-realm" } },
    { path: "/workflows", handle: { access: "manage-realm" } },
    { path: "/page-section", handle: { access: "view-realm" } }
];

export const RootRoute = {
    path: "/",
    children: routes
};
