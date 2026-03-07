import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const PoliciesTab = lazy(() =>
    import("../../pages/realm-settings/policies-tab").then((m) => ({
        default: m.PoliciesTab,
    })),
);

export const Route = createFileRoute(
    "/_app/$realm/realm-settings/client-policies/$tab",
)({
    component: PoliciesTab,
});
