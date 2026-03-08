import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const ContentComponent = lazy(() => import("../../../pages/content/content-component"));

export const Route = createFileRoute("/_layout/content/$componentId")({
    component: ContentComponent
});
