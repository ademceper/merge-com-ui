/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/client-scopes/routes.ts"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import type { AppRouteObject } from "../routes";
import { ClientScopeRoute } from "./routes/ClientScope";
import { ClientScopesRoute } from "./routes/ClientScopes";
import { MapperRoute } from "./routes/Mapper";
import { NewClientScopeRoute } from "./routes/NewClientScope";

const routes: AppRouteObject[] = [
    NewClientScopeRoute,
    MapperRoute,
    ClientScopeRoute,
    ClientScopesRoute
];

export default routes;
