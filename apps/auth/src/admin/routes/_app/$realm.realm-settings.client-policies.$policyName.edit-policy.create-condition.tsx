import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const NewClientPolicyCondition = lazy(
    () => import("../../pages/realm-settings/new-client-policy-condition"),
);

export const Route = createFileRoute(
    "/_app/$realm/realm-settings/client-policies/$policyName/edit-policy/create-condition",
)({
    component: NewClientPolicyCondition,
});
