import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/$realm/page-section/$providerId/add")({
    component: lazyRouteComponent(() => import("../../../../../pages/page/page"), "Page")
});
