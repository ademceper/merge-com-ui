/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/workflows/routes/Workflows.tsx"
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

export type WorkflowsParams = { realm: string };

const WorkflowsSection = lazy(() => import("../WorkflowsSection"));

export const WorkflowsRoute: AppRouteObject = {
    path: "/:realm/workflows",
    element: <WorkflowsSection />,
    breadcrumb: t => t("workflows"),
    handle: {
        access: "manage-realm"
    }
};

export const toWorkflows = (params: WorkflowsParams): Partial<Path> => ({
    pathname: generateEncodedPath(WorkflowsRoute.path, params)
});
