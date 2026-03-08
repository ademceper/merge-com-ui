import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const Resources = lazy(() => import("../../pages/resources/resources"));

export const Route = createFileRoute("/_layout/resources")({
    component: Resources
});
