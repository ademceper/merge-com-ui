import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const CreateFlow = lazy(
    () => import("../../../../../pages/authentication/form/create-flow"),
);

export const Route = createFileRoute("/_app/$realm/authentication/flows/create")({
    component: CreateFlow,
});
