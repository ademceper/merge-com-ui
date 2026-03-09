import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { EventsSkeleton } from "../../../../shared/ui/skeletons/events-skeleton";

export const Route = createFileRoute("/_app/$realm/events/$tab")({
    pendingComponent: EventsSkeleton,
    component: lazyRouteComponent(() => import("../../../../pages/events/events-section"), "EventsSection")
});
