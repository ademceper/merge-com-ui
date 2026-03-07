import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const DetailOrganization = lazy(
    () => import("../../pages/organizations/detail-organization"),
);

export const Route = createFileRoute("/_app/$realm/organizations/$id/$tab")({
    component: DetailOrganization,
});
