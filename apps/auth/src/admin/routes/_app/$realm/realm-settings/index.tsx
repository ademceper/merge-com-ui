import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/$realm/realm-settings/")({
    component: lazyRouteComponent(
        () => import("../../../../pages/realm-settings/realm-settings-tabs"),
        "RealmSettingsTabs"
    )
});
