import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

import Organizations from "../../pages/organizations/organizations";

export const Route = createFileRoute("/_layout/organizations")({
    component: Organizations,
});
