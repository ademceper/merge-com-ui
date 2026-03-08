import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/$realm/client-scopes/")({
    component: lazyRouteComponent(
        () => import("../../../../pages/client-scopes/client-scopes-section"),
        "ClientScopesSection"
    )
});
