import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { AuthenticationSkeleton } from "../../../../shared/ui/skeletons/authentication-skeleton";

export const Route = createFileRoute("/_app/$realm/authentication/$tab")({
    pendingComponent: AuthenticationSkeleton,
    component: lazyRouteComponent(
        () => import("../../../../pages/authentication/authentication-section"),
        "AuthenticationSection"
    )
});
