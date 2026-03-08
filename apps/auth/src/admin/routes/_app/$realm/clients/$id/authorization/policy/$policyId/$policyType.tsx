import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const PolicyDetails = lazy(
    () => import("../../../../../../../../pages/clients/authorization/policy/policy-details"),
);

export const Route = createFileRoute(
    "/_app/$realm/clients/$id/authorization/policy/$policyId/$policyType",
)({
    component: PolicyDetails,
});
