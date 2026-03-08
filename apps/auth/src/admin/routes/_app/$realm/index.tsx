import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const RedirectToOrganizations = lazy(
    () => import("../../../pages/organizations/redirect-to-organizations"),
);

export const Route = createFileRoute("/_app/$realm/")({
    component: RedirectToOrganizations,
});
