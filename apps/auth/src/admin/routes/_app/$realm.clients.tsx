import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const ClientsSection = lazy(
    () => import("../../pages/clients/clients-section"),
);

export const Route = createFileRoute("/_app/$realm/clients")({
    component: ClientsSection,
});
