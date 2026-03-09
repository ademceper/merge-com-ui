import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { adminClient } from "../../../../app/admin-client";
import { usersQueryOptions } from "../../../../pages/user/hooks/use-users";
import { UsersSkeleton } from "../../../../shared/ui/skeletons/users-skeleton";

export const Route = createFileRoute("/_app/$realm/users/")({
    loader: ({ context: { queryClient } }) => {
        if (!adminClient) return;
        return queryClient.ensureQueryData(usersQueryOptions());
    },
    pendingComponent: UsersSkeleton,
    component: lazyRouteComponent(
        () => import("../../../../pages/user/users-section"),
        "UsersSection"
    )
});
