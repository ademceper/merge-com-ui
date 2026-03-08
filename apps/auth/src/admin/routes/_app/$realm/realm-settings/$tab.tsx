import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/$realm/realm-settings/$tab")({
    component: lazyRouteComponent(
        () => import("../../../../pages/realm-settings/realm-settings-tabs"),
        "RealmSettingsTabs"
    )
});
