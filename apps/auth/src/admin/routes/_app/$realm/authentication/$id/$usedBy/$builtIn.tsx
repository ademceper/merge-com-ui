import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/$realm/authentication/$id/$usedBy/$builtIn")({
    component: lazyRouteComponent(
        () => import("../../../../../../pages/authentication/flow-details"),
        "FlowDetails"
    )
});
