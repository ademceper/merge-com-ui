import type { AppRouteObject } from "../../app/routes";
import { NewPermissionConfigurationRoute } from "./routes/new-permission-configuration";
import { NewPermissionPolicyRoute } from "./routes/new-permission-policy";
import { PermissionConfigurationDetailRoute } from "./routes/permission-configuration-details";
import { PermissionPolicyDetailsRoute } from "./routes/permission-policy-details";
import { PermissionsConfigurationRoute } from "./routes/permissions-configuration";
import { PermissionsConfigurationTabsRoute } from "./routes/permissions-configuration-tabs";
import { PermissionsPoliciesRoute } from "./routes/permissions-policies";

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
