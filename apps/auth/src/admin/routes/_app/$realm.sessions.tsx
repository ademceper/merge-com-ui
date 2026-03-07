import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const SessionsSection = lazy(
    () => import("../../pages/sessions/sessions-section"),
);

export const Route = createFileRoute("/_app/$realm/sessions")({
    component: SessionsSection,
});
