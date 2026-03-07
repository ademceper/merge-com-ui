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
// but kept for breadcrumb resolution and access control lookups.
export const routes: AppRouteObject[] = [];

export const RootRoute = {
    path: "/",
    children: routes
};
