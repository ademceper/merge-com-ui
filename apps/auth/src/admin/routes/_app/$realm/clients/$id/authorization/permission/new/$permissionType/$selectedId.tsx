import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute(
    "/_app/$realm/clients/$id/authorization/permission/new/$permissionType/$selectedId",
)({
    component: lazyRouteComponent(() => import("../../../../../../../../../pages/clients/authorization/permission-details")),
});
