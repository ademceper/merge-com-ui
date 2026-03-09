import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { adminClient } from "../../../../app/admin-client";
import { realmRolesQueryOptions } from "../../../../pages/realm-roles/hooks/use-realm-roles";
import { RealmRolesSkeleton } from "../../../../shared/ui/skeletons/realm-roles-skeleton";

export const Route = createFileRoute("/_app/$realm/roles/")({
    loader: ({ context: { queryClient } }) => {
        if (!adminClient) return;
        return queryClient.ensureQueryData(realmRolesQueryOptions());
    },
    pendingComponent: RealmRolesSkeleton,
    component: lazyRouteComponent(
        () => import("../../../../pages/realm-roles/realm-roles-section"),
        "RealmRolesSection"
    )
});
