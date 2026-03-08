import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute(
    "/_app/$realm/clients/$id/authorization/resource/new"
)({
    component: lazyRouteComponent(
        () => import("../../../../../../../pages/clients/authorization/resource-details"),
        "ResourceDetails"
    )
});
