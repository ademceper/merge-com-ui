import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const OrganizationSection = lazy(
    () => import("../../../../pages/organizations/organizations-section"),
);

export const Route = createFileRoute("/_app/$realm/organizations/")({
    component: OrganizationSection,
});
