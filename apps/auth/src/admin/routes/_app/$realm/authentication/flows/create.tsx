import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/$realm/authentication/flows/create")({
    component: lazyRouteComponent(
        () => import("../../../../../pages/authentication/form/create-flow"),
        "CreateFlow"
    )
});
