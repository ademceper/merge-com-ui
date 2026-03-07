import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const EventsSection = lazy(
    () => import("../../pages/events/events-section"),
);

export const Route = createFileRoute("/_app/$realm/events")({
    component: EventsSection,
});
