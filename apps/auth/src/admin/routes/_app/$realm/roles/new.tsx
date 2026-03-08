import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const CreateRealmRole = lazy(
    () => import("../../../../pages/realm-roles/create-realm-role"),
);

export const Route = createFileRoute("/_app/$realm/roles/new")({
    component: CreateRealmRole,
});
