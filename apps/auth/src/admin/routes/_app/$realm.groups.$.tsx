import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const GroupsSection = lazy(
    () => import("../../pages/groups/groups-section"),
);

export const Route = createFileRoute("/_app/$realm/groups/$")({
    component: GroupsSection,
});
