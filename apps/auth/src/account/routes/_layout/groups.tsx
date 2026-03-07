import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const Groups = lazy(() => import("../../pages/groups/groups"));

export const Route = createFileRoute("/_layout/groups")({
    component: Groups,
});
