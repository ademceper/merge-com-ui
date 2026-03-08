import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const CustomProviderSettings = lazy(
    () =>
        import("../../../../../pages/user-federation/custom/custom-provider-settings"),
);

export const Route = createFileRoute(
    "/_app/$realm/user-federation/$providerId/$id",
)({
    component: CustomProviderSettings,
});
