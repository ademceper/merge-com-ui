import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { adminClient } from "../../../../app/admin-client";
import { clientScopesQueryOptions } from "../../../../pages/client-scopes/hooks/use-client-scopes";
import { ClientScopesSkeleton } from "../../../../shared/ui/skeletons/client-scopes-skeleton";

export const Route = createFileRoute("/_app/$realm/client-scopes/")({
    loader: ({ context: { queryClient } }) => {
        if (!adminClient) return;
        return queryClient.ensureQueryData(clientScopesQueryOptions());
    },
    pendingComponent: ClientScopesSkeleton,
    component: lazyRouteComponent(
        () => import("../../../../pages/client-scopes/client-scopes-section"),
        "ClientScopesSection"
    )
});
