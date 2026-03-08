import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const RealmRolesSection = lazy(
    () => import("../../../../pages/realm-roles/realm-roles-section"),
);

export const Route = createFileRoute("/_app/$realm/roles/")({
    component: RealmRolesSection,
});
