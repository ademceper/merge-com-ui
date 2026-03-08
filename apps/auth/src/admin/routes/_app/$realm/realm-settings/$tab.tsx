import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const RealmSettingsTabs = lazy(() =>
    import("../../../../pages/realm-settings/realm-settings-tabs").then((m) => ({
        default: m.RealmSettingsTabs,
    })),
);

export const Route = createFileRoute("/_app/$realm/realm-settings/$tab")({
    component: RealmSettingsTabs,
});
