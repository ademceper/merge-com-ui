import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/$realm/users/")({
    component: lazyRouteComponent(() => import("../../../../pages/user/users-section"), "UsersSection")
});
