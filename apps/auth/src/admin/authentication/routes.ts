/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/authentication/routes.ts"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import type { AppRouteObject } from "../routes";
import { AuthenticationRoute, AuthenticationRouteWithTab } from "./routes/Authentication";
import { CreateFlowRoute } from "./routes/CreateFlow";
import { FlowRoute, FlowWithBuiltInRoute } from "./routes/Flow";

const routes: AppRouteObject[] = [
    AuthenticationRoute,
    AuthenticationRouteWithTab,
    CreateFlowRoute,
    FlowRoute,
    FlowWithBuiltInRoute
];

export default routes;
