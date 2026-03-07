import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const FlowDetails = lazy(
    () => import("../../pages/authentication/flow-details"),
);

export const Route = createFileRoute("/_app/$realm/authentication/$id/$usedBy")({
    component: FlowDetails,
});
