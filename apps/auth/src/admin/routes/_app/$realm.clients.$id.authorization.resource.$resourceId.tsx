import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const ResourceDetails = lazy(
    () => import("../../pages/clients/authorization/resource-details"),
);

export const Route = createFileRoute(
    "/_app/$realm/clients/$id/authorization/resource/$resourceId",
)({
    component: ResourceDetails,
});
