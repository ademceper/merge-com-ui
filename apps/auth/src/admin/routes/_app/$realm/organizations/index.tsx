import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/$realm/organizations/")({
    component: lazyRouteComponent(
        () => import("../../../../pages/organizations/organizations-section"),
        "OrganizationSection"
    )
});
