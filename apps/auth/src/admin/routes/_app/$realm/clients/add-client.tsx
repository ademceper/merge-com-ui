import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const NewClientForm = lazy(
    () => import("../../../../pages/clients/add/new-client-form"),
);

export const Route = createFileRoute("/_app/$realm/clients/add-client")({
    component: NewClientForm,
});
