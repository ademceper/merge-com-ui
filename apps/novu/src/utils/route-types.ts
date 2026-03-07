import type { ComponentType } from "react";
import type { NonIndexRouteObject } from "react-router-dom";

/**
 * Route handle with access control metadata.
 * `permission` maps to PermissionsEnum from @novu/shared.
 */
export interface AppRouteHandle {
	permission?: string;
	isNotFound?: true;
}

/**
 * Type-safe route object with breadcrumb and access metadata.
 * Extends React Router's route with app-level concerns.
 */
export interface AppRouteObject extends NonIndexRouteObject {
	path?: string;
	breadcrumb?: string | ComponentType<any>;
	handle?: AppRouteHandle;
}
