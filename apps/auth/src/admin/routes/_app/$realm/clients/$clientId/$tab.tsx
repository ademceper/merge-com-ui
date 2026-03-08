import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const ClientDetails = lazy(
    () => import("../../../../../pages/clients/client-details"),
);

export const Route = createFileRoute("/_app/$realm/clients/$clientId/$tab")({
    component: ClientDetails,
});
