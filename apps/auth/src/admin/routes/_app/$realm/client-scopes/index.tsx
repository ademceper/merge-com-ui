import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const ClientScopesSection = lazy(
    () => import("../../../../pages/client-scopes/client-scopes-section"),
);

export const Route = createFileRoute("/_app/$realm/client-scopes/")({
    component: ClientScopesSection,
});
