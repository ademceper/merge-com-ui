/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/events/routes/Events.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { lazy } from "react";
import type { Path } from "react-router-dom";
import { generateEncodedPath } from "../../utils/generateEncodedPath";
import type { AppRouteObject } from "../../routes";

export type EventsTab = "user-events" | "admin-events";

export type EventsParams = {
    realm: string;
    tab?: EventsTab;
};

const EventsSection = lazy(() => import("../EventsSection"));

export const EventsRoute: AppRouteObject = {
    path: "/:realm/events",
    element: <EventsSection />,
    breadcrumb: t => t("titleEvents"),
    handle: {
        access: "view-events"
    }
};

export const EventsRouteWithTab: AppRouteObject = {
    ...EventsRoute,
    path: "/:realm/events/:tab"
};

export const toEvents = (params: EventsParams): Partial<Path> => {
    const path = params.tab ? EventsRouteWithTab.path : EventsRoute.path;

    return {
        pathname: generateEncodedPath(path, params)
    };
};
