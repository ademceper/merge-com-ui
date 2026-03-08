import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/$realm/users/$id/$tab")({
    component: lazyRouteComponent(() => import("../../../../../pages/user/edit-user")),
});
