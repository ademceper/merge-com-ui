import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { FormSkeleton } from "../../../../../shared/ui/skeletons/form-skeleton";

export const Route = createFileRoute("/_app/$realm/page-section/$providerId/$id")({
    pendingComponent: FormSkeleton,
    component: lazyRouteComponent(() => import("../../../../../pages/page/page"), "Page")
});
