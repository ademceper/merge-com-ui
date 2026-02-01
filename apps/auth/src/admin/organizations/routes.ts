/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/organizations/routes.ts"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import type { AppRouteObject } from "../routes";
import { AddOrganizationRoute } from "./routes/AddOrganization";
import { EditOrganizationRoute } from "./routes/EditOrganization";
import { OrganizationsRoute } from "./routes/Organizations";

const routes: AppRouteObject[] = [
    OrganizationsRoute,
    AddOrganizationRoute,
    EditOrganizationRoute
];

export default routes;
