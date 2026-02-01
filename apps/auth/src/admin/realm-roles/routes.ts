/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/realm-roles/routes.ts"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import type { AppRouteObject } from "../routes";
import { AddRoleRoute } from "./routes/AddRole";
import { RealmRoleRoute } from "./routes/RealmRole";
import { RealmRolesRoute } from "./routes/RealmRoles";

const routes: AppRouteObject[] = [RealmRolesRoute, AddRoleRoute, RealmRoleRoute];

export default routes;
