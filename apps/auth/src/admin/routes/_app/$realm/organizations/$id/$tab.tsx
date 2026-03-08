import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/$realm/organizations/$id/$tab")({
    component: lazyRouteComponent(
        () => import("../../../../../pages/organizations/detail-organization"),
        "DetailOrganization"
    )
});
