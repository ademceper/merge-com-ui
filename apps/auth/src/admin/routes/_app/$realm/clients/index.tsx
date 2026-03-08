import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/$realm/clients/")({
    component: lazyRouteComponent(
        () => import("../../../../pages/clients/clients-section"),
        "ClientsSection"
    )
});
