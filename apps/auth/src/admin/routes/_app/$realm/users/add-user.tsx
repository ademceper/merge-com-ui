import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/$realm/users/add-user")({
    component: lazyRouteComponent(() => import("../../../../pages/user/create-user")),
});
