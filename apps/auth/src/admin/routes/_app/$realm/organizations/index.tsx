import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { adminClient } from "../../../../app/admin-client";
import { organizationsQueryOptions } from "../../../../pages/organizations/hooks/use-organizations";
import { OrganizationsSkeleton } from "../../../../shared/ui/skeletons/organizations-skeleton";

export const Route = createFileRoute("/_app/$realm/organizations/")({
    loader: ({ context: { queryClient } }) => {
        if (!adminClient) return;
        return queryClient.ensureQueryData(organizationsQueryOptions());
    },
    pendingComponent: OrganizationsSkeleton,
    component: lazyRouteComponent(
        () => import("../../../../pages/organizations/organizations-section"),
        "OrganizationSection"
    )
});
