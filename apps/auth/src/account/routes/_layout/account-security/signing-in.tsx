import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const SigningIn = lazy(() => import("../../../pages/account-security/signing-in"));

export const Route = createFileRoute("/_layout/account-security/signing-in")({
    component: SigningIn
});
