import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const UserFederationSection = lazy(
    () => import("../../pages/user-federation/user-federation-section"),
);

export const Route = createFileRoute("/_app/$realm/user-federation")({
    component: UserFederationSection,
});
