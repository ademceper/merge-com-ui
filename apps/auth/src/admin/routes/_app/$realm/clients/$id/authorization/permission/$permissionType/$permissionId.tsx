import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute(
    "/_app/$realm/clients/$id/authorization/permission/$permissionType/$permissionId",
)({
    component: lazyRouteComponent(() => import("../../../../../../../../pages/clients/authorization/permission-details")),
});
