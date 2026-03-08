import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const Applications = lazy(() => import("../../pages/applications/applications"));

export const Route = createFileRoute("/_layout/applications")({
    component: Applications
});
