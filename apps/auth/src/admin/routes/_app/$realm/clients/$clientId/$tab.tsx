import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/$realm/clients/$clientId/$tab")({
    component: lazyRouteComponent(
        () => import("../../../../../pages/clients/client-details"),
        "ClientDetails"
    )
});
