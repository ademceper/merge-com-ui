import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { UsersSkeleton } from "../../../../shared/ui/skeletons/users-skeleton";

export const Route = createFileRoute("/_app/$realm/users/$tab")({
    pendingComponent: UsersSkeleton,
    component: lazyRouteComponent(() => import("../../../../pages/user/users-section"), "UsersSection")
});
