import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const Page = lazy(
    () => import("../../pages/page/page"),
);

export const Route = createFileRoute(
    "/_app/$realm/page-section/$providerId/add",
)({
    component: Page,
});
