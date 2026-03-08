import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const MappingDetails = lazy(
    () => import("../../../../../../../pages/client-scopes/details/mapping-details"),
);

export const Route = createFileRoute(
    "/_app/$realm/client-scopes/$id/mappers/$mapperId/$viewMode",
)({
    component: MappingDetails,
});
