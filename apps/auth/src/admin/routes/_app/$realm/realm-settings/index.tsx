import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { RealmSettingsSkeleton } from "../../../../shared/ui/skeletons/realm-settings-skeleton";

export const Route = createFileRoute("/_app/$realm/realm-settings/")({
    pendingComponent: RealmSettingsSkeleton,
    component: lazyRouteComponent(
        () => import("../../../../pages/realm-settings/realm-settings-tabs"),
        "RealmSettingsTabs"
    )
});
