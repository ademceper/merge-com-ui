import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/$realm/client-scopes/$id/$tab")({
    component: lazyRouteComponent(() => import("../../../../../pages/client-scopes/edit-client-scope")),
});
