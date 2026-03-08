import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute(
    "/_app/$realm/clients/client-registration/$subTab/$providerId/$id",
)({
    component: lazyRouteComponent(() => import("../../../../../../../pages/clients/registration/detail-provider")),
});
