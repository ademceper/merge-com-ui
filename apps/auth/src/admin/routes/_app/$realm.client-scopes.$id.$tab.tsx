import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const EditClientScope = lazy(
    () => import("../../pages/client-scopes/edit-client-scope"),
);

export const Route = createFileRoute("/_app/$realm/client-scopes/$id/$tab")({
    component: EditClientScope,
});
