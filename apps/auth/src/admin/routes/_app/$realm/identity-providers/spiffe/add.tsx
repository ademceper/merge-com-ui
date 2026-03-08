import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/$realm/identity-providers/spiffe/add")({
    component: lazyRouteComponent(
        () => import("../../../../../pages/identity-providers/add/add-spiffe-connect"),
        "AddSamlConnect"
    )
});
