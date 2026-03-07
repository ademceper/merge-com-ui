import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const NewOrganization = lazy(
    () => import("../../pages/organizations/new-organization"),
);

export const Route = createFileRoute("/_app/$realm/organizations/new")({
    component: NewOrganization,
});
