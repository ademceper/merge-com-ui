import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/$realm/roles/new")({
    component: lazyRouteComponent(
        () => import("../../../../pages/realm-roles/create-realm-role"),
        "CreateRealmRole"
    )
});
