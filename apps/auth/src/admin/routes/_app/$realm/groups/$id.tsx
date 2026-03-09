import { createFileRoute } from "@tanstack/react-router";
import { DetailSkeleton } from "../../../../shared/ui/skeletons/detail-skeleton";

// This route exists for the route tree but the parent page (groups-section)
// renders the GroupTable component directly with the required props.
export const Route = createFileRoute("/_app/$realm/groups/$id")({
    pendingComponent: DetailSkeleton,
    component: () => null
});
