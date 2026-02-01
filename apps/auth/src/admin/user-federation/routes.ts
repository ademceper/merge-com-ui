/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/user-federation/routes.ts"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import type { AppRouteObject } from "../routes";
import { CustomUserFederationRoute } from "./routes/CustomUserFederation";
import { NewCustomUserFederationRoute } from "./routes/NewCustomUserFederation";
import { NewKerberosUserFederationRoute } from "./routes/NewKerberosUserFederation";
import { NewLdapUserFederationRoute } from "./routes/NewLdapUserFederation";
import { UserFederationRoute } from "./routes/UserFederation";
import { UserFederationKerberosRoute } from "./routes/UserFederationKerberos";
import {
    UserFederationLdapRoute,
    UserFederationLdapWithTabRoute
} from "./routes/UserFederationLdap";
import { UserFederationLdapMapperRoute } from "./routes/UserFederationLdapMapper";
import { UserFederationsKerberosRoute } from "./routes/UserFederationsKerberos";
import { UserFederationsLdapRoute } from "./routes/UserFederationsLdap";

const routes: AppRouteObject[] = [
    UserFederationRoute,
    UserFederationsKerberosRoute,
    NewKerberosUserFederationRoute,
    UserFederationKerberosRoute,
    UserFederationsLdapRoute,
    NewLdapUserFederationRoute,
    UserFederationLdapRoute,
    UserFederationLdapWithTabRoute,
    UserFederationLdapMapperRoute,
    NewCustomUserFederationRoute,
    CustomUserFederationRoute
];

export default routes;
