/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/realm-settings/routes.ts"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import type { AppRouteObject } from "../routes";
import { AddAttributeRoute } from "./routes/AddAttribute";
import { AddClientPolicyRoute } from "./routes/AddClientPolicy";
import { AddClientProfileRoute } from "./routes/AddClientProfile";
import { NewClientPolicyConditionRoute } from "./routes/AddCondition";
import { AddExecutorRoute } from "./routes/AddExecutor";
import { AttributeRoute } from "./routes/Attribute";
import { ClientPoliciesRoute } from "./routes/ClientPolicies";
import { ClientProfileRoute } from "./routes/ClientProfile";
import { EditAttributesGroupRoute } from "./routes/EditAttributesGroup";
import { EditClientPolicyRoute } from "./routes/EditClientPolicy";
import { EditClientPolicyConditionRoute } from "./routes/EditCondition";
import { ExecutorRoute } from "./routes/Executor";
import { KeyProviderFormRoute } from "./routes/KeyProvider";
import { KeysRoute } from "./routes/KeysTab";
import { NewAttributesGroupRoute } from "./routes/NewAttributesGroup";
import { RealmSettingsRoute, RealmSettingsRouteWithTab } from "./routes/RealmSettings";
import { ThemeTabRoute } from "./routes/ThemesTab";
import { UserProfileRoute } from "./routes/UserProfile";

const routes: AppRouteObject[] = [
    RealmSettingsRoute,
    RealmSettingsRouteWithTab,
    KeysRoute,
    KeyProviderFormRoute,
    ClientPoliciesRoute,
    AddClientProfileRoute,
    AddExecutorRoute,
    ClientProfileRoute,
    ExecutorRoute,
    AddClientPolicyRoute,
    EditClientPolicyRoute,
    NewClientPolicyConditionRoute,
    EditClientPolicyConditionRoute,
    UserProfileRoute,
    AddAttributeRoute,
    AttributeRoute,
    NewAttributesGroupRoute,
    EditAttributesGroupRoute,
    ThemeTabRoute
];

export default routes;
