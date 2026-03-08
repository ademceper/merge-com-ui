import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute(
    "/_app/$realm/permissions/$permissionClientId/policies/$policyId/$policyType",
)({
    component: lazyRouteComponent(() => import(
            "../../../../../../../pages/permissions-configuration/permission-configuration/permission-configuration-details"
        )),
});
