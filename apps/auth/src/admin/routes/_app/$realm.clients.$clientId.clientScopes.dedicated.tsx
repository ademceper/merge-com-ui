import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const DedicatedScopes = lazy(
    () => import("../../pages/clients/scopes/dedicated-scopes"),
);

export const Route = createFileRoute(
    "/_app/$realm/clients/$clientId/clientScopes/dedicated",
)({
    component: DedicatedScopes,
});
