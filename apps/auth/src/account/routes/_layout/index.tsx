import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const PersonalInfo = lazy(() => import("../../pages/personal-info/personal-info"));

export const Route = createFileRoute("/_layout/")({
    component: PersonalInfo,
});
