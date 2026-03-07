import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const LinkedAccounts = lazy(() => import("../../../pages/account-security/linked-accounts"));

export const Route = createFileRoute("/_layout/account-security/linked-accounts")({
    component: LinkedAccounts,
});
