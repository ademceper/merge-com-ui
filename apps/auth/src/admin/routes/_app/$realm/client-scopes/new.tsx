import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const CreateClientScope = lazy(
    () => import("../../../../pages/client-scopes/create-client-scope"),
);

export const Route = createFileRoute("/_app/$realm/client-scopes/new")({
    component: CreateClientScope,
});
