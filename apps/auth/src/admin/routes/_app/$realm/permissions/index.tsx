import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/$realm/permissions/")({
    component: lazyRouteComponent(() => import(
            "../../../../pages/permissions-configuration/permissions-configuration-section"
        )),
});
