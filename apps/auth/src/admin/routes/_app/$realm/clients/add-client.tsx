import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/$realm/clients/add-client")({
    component: lazyRouteComponent(() => import("../../../../pages/clients/add/new-client-form")),
});
