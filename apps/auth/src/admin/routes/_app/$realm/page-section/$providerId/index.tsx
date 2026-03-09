import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { PageSectionSkeleton } from "../../../../../shared/ui/skeletons/page-section-skeleton";

export const Route = createFileRoute("/_app/$realm/page-section/$providerId/")({
    pendingComponent: PageSectionSkeleton,
    component: lazyRouteComponent(() => import("../../../../../pages/page/page-list"), "PageList")
});
