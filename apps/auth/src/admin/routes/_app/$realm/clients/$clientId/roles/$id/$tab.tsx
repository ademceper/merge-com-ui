import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/$realm/clients/$clientId/roles/$id/$tab")({
    component: lazyRouteComponent(
        () => import("../../../../../../../pages/realm-roles/realm-role-tabs"),
        "RealmRoleTabs"
    )
});
