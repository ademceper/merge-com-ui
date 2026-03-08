import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/$realm/clients/$clientId/roles/new")({
    component: lazyRouteComponent(() => import("../../../../../../pages/clients/roles/create-client-role")),
});
