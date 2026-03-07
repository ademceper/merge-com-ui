import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const CreateClientRole = lazy(
    () => import("../../pages/clients/roles/create-client-role"),
);

export const Route = createFileRoute("/_app/$realm/clients/$clientId/roles/new")({
    component: CreateClientRole,
});
