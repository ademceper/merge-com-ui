import { lazy } from "react";
import type { Path } from "react-router-dom";
import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";
import type { AppRouteObject } from "../../../app/routes";

export type DashboardTab = "info" | "providers" | "welcome";

export type DashboardParams = { realm?: string; tab?: DashboardTab };

const Dashboard = lazy(() => import("../dashboard"));

const RedirectToOrganizations = lazy(() => import("../../organizations/redirect-to-organizations"));

export const DashboardRoute: AppRouteObject = {
    path: "/",
    element: <RedirectToOrganizations />,
    breadcrumb: t => t("home"),
    handle: {
        access: "anyone"
    }
};

export const DashboardRouteWithRealm: AppRouteObject = {
    path: "/:realm",
    element: <RedirectToOrganizations />,
    breadcrumb: t => t("home"),
    handle: {
        access: "anyone"
    }
};

export const DashboardRouteWithTab: AppRouteObject = {
    path: "/:realm/:tab",
    element: <Dashboard />,
    breadcrumb: t => t("home"),
    handle: {
        access: "anyone"
    }
};

export const toDashboard = (params: DashboardParams): Partial<Path> => {
    const pathname = params.realm
        ? params.tab
            ? DashboardRouteWithTab.path
            : DashboardRouteWithRealm.path
        : DashboardRoute.path;

    return {
        pathname: generateEncodedPath(pathname, params)
    };
};
