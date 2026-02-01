/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/realm/routes.ts"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import type { AppRouteObject } from "../routes";
import { RealmRoute } from "./RealmRoutes";

const routes: AppRouteObject[] = [RealmRoute];

export default routes;
