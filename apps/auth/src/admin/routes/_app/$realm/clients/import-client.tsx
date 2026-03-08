import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/$realm/clients/import-client")({
    component: lazyRouteComponent(() => import("../../../../pages/clients/import/import-form")),
});
