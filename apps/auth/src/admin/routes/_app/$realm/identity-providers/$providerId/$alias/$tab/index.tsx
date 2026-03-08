import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const DetailSettings = lazy(
    () => import("../../../../../../../pages/identity-providers/add/detail-settings"),
);

export const Route = createFileRoute(
    "/_app/$realm/identity-providers/$providerId/$alias/$tab/",
)({
    component: DetailSettings,
});
