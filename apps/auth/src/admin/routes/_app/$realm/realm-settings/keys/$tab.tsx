import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/$realm/realm-settings/keys/$tab")({
    component: lazyRouteComponent(
        () => import("../../../../../pages/realm-settings/keys/keys-tab"),
        "KeysTab"
    )
});
