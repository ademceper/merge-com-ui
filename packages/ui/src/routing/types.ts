import type { TFunction } from "i18next";
import type { ComponentType } from "react";
import type { NonIndexRouteObject } from "react-router-dom";

/**
 * Route handle with access control and metadata.
 * `access` is generic — each app defines its own access type.
 */
export interface AppRouteHandle<TAccess = string> {
    access: TAccess | TAccess[];
    isNotFound?: true;
}

/**
 * Type-safe route object with breadcrumb and access control.
 * Extends React Router's NonIndexRouteObject with app-level metadata.
 */
export interface AppRouteObject<TAccess = string> extends NonIndexRouteObject {
    path: string;
    breadcrumb?: (t: TFunction) => string | ComponentType<any>;
    handle: AppRouteHandle<TAccess>;
}
