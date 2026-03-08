import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const AuthenticationSection = lazy(
    () => import("../../../../pages/authentication/authentication-section"),
);

export const Route = createFileRoute("/_app/$realm/authentication/$tab")({
    component: AuthenticationSection,
});
