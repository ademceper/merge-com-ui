/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/workflows/routes.ts"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import type { AppRouteObject } from "../routes";
import { WorkflowsRoute } from "./routes/Workflows";
import { WorkflowDetailRoute } from "./routes/WorkflowDetail";

const routes: AppRouteObject[] = [WorkflowsRoute, WorkflowDetailRoute];

export default routes;
