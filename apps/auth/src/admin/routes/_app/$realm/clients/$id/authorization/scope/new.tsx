import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const ScopeDetails = lazy(
    () => import("../../../../../../../pages/clients/authorization/scope-details"),
);

export const Route = createFileRoute(
    "/_app/$realm/clients/$id/authorization/scope/new",
)({
    component: ScopeDetails,
});
