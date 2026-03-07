import type { AppRouteObject } from "../../app/routes";
import { AddClientRoute } from "./routes/add-client";
import {
    AddRegistrationProviderRoute,
    EditRegistrationProviderRoute
} from "./routes/add-registration-provider";
import { AuthorizationRoute } from "./routes/authentication-tab";
import { ClientRoute } from "./routes/client";
import { ClientRegistrationRoute } from "./routes/client-registration";
import { ClientRoleRoute } from "./routes/client-role";
import { ClientsRoute, ClientsRouteWithTab } from "./routes/clients";
import { ClientScopesRoute } from "./routes/client-scope-tab";
import {
    DedicatedScopeDetailsRoute,
    DedicatedScopeDetailsWithTabRoute
} from "./routes/dedicated-scope-details";
import { ImportClientRoute } from "./routes/import-client";
import { MapperRoute } from "./routes/mapper";
import {
    NewPermissionRoute,
    NewPermissionWithSelectedIdRoute
} from "./routes/new-permission";
import { NewPolicyRoute } from "./routes/new-policy";
import { NewResourceRoute } from "./routes/new-resource";
import { NewRoleRoute } from "./routes/new-role";
import { NewScopeRoute } from "./routes/new-scope";
import { PermissionDetailsRoute } from "./routes/permission-details";
import { PolicyDetailsRoute } from "./routes/policy-details";
import {
    ResourceDetailsRoute,
    ResourceDetailsWithResourceIdRoute
} from "./routes/resource";
import { ScopeDetailsRoute, ScopeDetailsWithScopeIdRoute } from "./routes/scope";

const routes: AppRouteObject[] = [
    ClientRegistrationRoute,
    AddRegistrationProviderRoute,
    EditRegistrationProviderRoute,
    AddClientRoute,
    ImportClientRoute,
    ClientsRoute,
    ClientsRouteWithTab,
    ClientRoute,
    MapperRoute,
    DedicatedScopeDetailsRoute,
    DedicatedScopeDetailsWithTabRoute,
    ClientScopesRoute,
    ClientRoleRoute,
    AuthorizationRoute,
    NewResourceRoute,
    ResourceDetailsRoute,
    ResourceDetailsWithResourceIdRoute,
    NewRoleRoute,
    NewScopeRoute,
    ScopeDetailsRoute,
    ScopeDetailsWithScopeIdRoute,
    NewPolicyRoute,
    PolicyDetailsRoute,
    NewPermissionRoute,
    NewPermissionWithSelectedIdRoute,
    PermissionDetailsRoute
];

export default routes;
