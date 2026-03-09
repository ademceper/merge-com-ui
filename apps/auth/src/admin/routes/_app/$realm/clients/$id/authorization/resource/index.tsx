import { createFileRoute } from "@tanstack/react-router";
import { DetailSkeleton } from "../../../../../../../shared/ui/skeletons/detail-skeleton";

// This route exists for the route tree but the parent page (client-details)
// renders the AuthorizationResources component directly with the required props.
export const Route = createFileRoute("/_app/$realm/clients/$id/authorization/resource/")({
    pendingComponent: DetailSkeleton,
    component: () => null
});
