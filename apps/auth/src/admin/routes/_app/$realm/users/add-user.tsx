import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { FormSkeleton } from "../../../../shared/ui/skeletons/form-skeleton";

export const Route = createFileRoute("/_app/$realm/users/add-user")({
    pendingComponent: FormSkeleton,
    component: lazyRouteComponent(() => import("../../../../pages/user/create-user"), "CreateUser")
});
