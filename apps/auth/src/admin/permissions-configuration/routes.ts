/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/permissions-configuration/routes.ts"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import type { AppRouteObject } from "../routes";
import { NewPermissionConfigurationRoute } from "./routes/NewPermissionConfiguration";
import { NewPermissionPolicyRoute } from "./routes/NewPermissionPolicy";
import { PermissionConfigurationDetailRoute } from "./routes/PermissionConfigurationDetails";
import { PermissionPolicyDetailsRoute } from "./routes/PermissionPolicyDetails";
import { PermissionsConfigurationRoute } from "./routes/PermissionsConfiguration";
import { PermissionsConfigurationTabsRoute } from "./routes/PermissionsConfigurationTabs";
import { PermissionsPoliciesRoute } from "./routes/PermissionsPolicies";

const routes: AppRouteObject[] = [
    NewPermissionConfigurationRoute,
    PermissionConfigurationDetailRoute,
    PermissionsConfigurationRoute,
    PermissionsConfigurationTabsRoute,
    PermissionsPoliciesRoute,
    NewPermissionPolicyRoute,
    PermissionPolicyDetailsRoute
];

export default routes;
