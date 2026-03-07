import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const AddMapper = lazy(
    () => import("../../pages/identity-providers/add/add-mapper"),
);

export const Route = createFileRoute(
    "/_app/$realm/identity-providers/$providerId/$alias/$tab/create",
)({
    component: AddMapper,
});
