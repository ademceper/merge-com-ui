import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute(
    "/_app/$realm/realm-settings/client-policies/$profileName/add-executor"
)({
    component: lazyRouteComponent(
        () => import("../../../../../../pages/realm-settings/executor-form"),
        "ExecutorForm"
    )
});
