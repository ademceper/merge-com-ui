import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute(
    "/_app/$realm/page-section/$providerId/",
)({
    component: lazyRouteComponent(() => import("../../../../../pages/page/page-list")),
});
