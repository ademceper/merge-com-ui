import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const IdentityProvidersSection = lazy(
    () => import("../../pages/identity-providers/identity-providers-section"),
);

export const Route = createFileRoute("/_app/$realm/identity-providers")({
    component: IdentityProvidersSection,
});
