import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/$realm/")({
    component: lazyRouteComponent(() => import("../../../pages/organizations/redirect-to-organizations")),
});
