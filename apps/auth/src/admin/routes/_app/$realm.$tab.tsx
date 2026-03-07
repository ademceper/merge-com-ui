import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const DashboardSection = lazy(
    () => import("../../pages/dashboard/dashboard"),
);

export const Route = createFileRoute("/_app/$realm/$tab")({
    component: DashboardSection,
});
