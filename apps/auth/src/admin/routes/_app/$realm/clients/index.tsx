import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { adminClient } from "../../../../app/admin-client";
import { clientsQueryOptions } from "../../../../pages/clients/hooks/use-clients";
import { ClientsSkeleton } from "../../../../shared/ui/skeletons/clients-skeleton";

export const Route = createFileRoute("/_app/$realm/clients/")({
    loader: ({ context: { queryClient } }) => {
        if (!adminClient) return;
        return queryClient.ensureQueryData(clientsQueryOptions());
    },
    pendingComponent: ClientsSkeleton,
    component: lazyRouteComponent(
        () => import("../../../../pages/clients/clients-section"),
        "ClientsSection"
    )
});
