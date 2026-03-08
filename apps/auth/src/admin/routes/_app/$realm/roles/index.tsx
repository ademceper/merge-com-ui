import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/$realm/roles/")({
    component: lazyRouteComponent(
        () => import("../../../../pages/realm-roles/realm-roles-section"),
        "RealmRolesSection"
    )
});
