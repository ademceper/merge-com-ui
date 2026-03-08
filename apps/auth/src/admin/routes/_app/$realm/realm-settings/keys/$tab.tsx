import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const KeysTab = lazy(() =>
    import("../../../../../pages/realm-settings/keys/keys-tab").then((m) => ({
        default: m.KeysTab,
    })),
);

export const Route = createFileRoute("/_app/$realm/realm-settings/keys/$tab")({
    component: KeysTab,
});
