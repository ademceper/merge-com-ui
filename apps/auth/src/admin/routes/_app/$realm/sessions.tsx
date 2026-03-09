import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { SessionsSkeleton } from "../../../shared/ui/skeletons/sessions-skeleton";

export const Route = createFileRoute("/_app/$realm/sessions")({
    pendingComponent: SessionsSkeleton,
    component: lazyRouteComponent(
        () => import("../../../pages/sessions/sessions-section"),
        "SessionsSection"
    )
});
